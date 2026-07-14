"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isValidCPF } from "@/lib/utils/validators";

const patientSchema = z
  .object({
    full_name: z.string().min(2, "Nome é obrigatório."),
    cpf: z
      .string()
      .optional()
      .transform((v) => v?.replace(/\D/g, "") || null)
      .refine((v) => !v || isValidCPF(v), "CPF inválido."),
    birth_date: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
    emergency_contact: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    status: z.enum(["active", "inactive", "archived"]).default("active"),
  });

export type PatientActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  redirectTo?: string;
};

export async function createPatientAction(
  _prev: PatientActionState,
  formData: FormData
): Promise<PatientActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? ""),
    birth_date: String(formData.get("birth_date") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    status: (String(formData.get("status") ?? "active") as "active" | "inactive" | "archived"),
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  const { error, data } = await supabase
    .from("patients")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Não foi possível criar o paciente." };
  }

  revalidatePath("/patients");
  return { success: "Paciente criado.", redirectTo: `/patients/${data.id}` };
}

export async function updatePatientAction(
  id: string,
  _prev: PatientActionState,
  formData: FormData
): Promise<PatientActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    full_name: String(formData.get("full_name") ?? "").trim(),
    cpf: String(formData.get("cpf") ?? ""),
    birth_date: String(formData.get("birth_date") ?? "") || null,
    phone: String(formData.get("phone") ?? "") || null,
    email: String(formData.get("email") ?? "") || null,
    emergency_contact: String(formData.get("emergency_contact") ?? "") || null,
    address: String(formData.get("address") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    status: (String(formData.get("status") ?? "active") as "active" | "inactive" | "archived"),
  };

  const parsed = patientSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  const { error } = await supabase
    .from("patients")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar." };

  revalidatePath(`/patients/${id}`);
  revalidatePath("/patients");
  return { success: "Paciente atualizado." };
}

export async function deletePatientAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("patients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/patients");
  return { success: "Paciente excluído." };
}
