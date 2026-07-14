"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome muito curto."),
  crp: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export type ProfileActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    crp: String(formData.get("crp") ?? "") || null,
    specialty: String(formData.get("specialty") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos.", fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", user.id);

  if (error) return { error: "Não foi possível atualizar o perfil." };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: "Perfil atualizado." };
}
