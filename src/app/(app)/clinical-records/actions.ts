"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const recordSchema = z.object({
  patient_id: z.string().uuid("Selecione um paciente."),
  session_date: z.string().min(1, "Selecione a data da sessão."),
  session_number: z.coerce.number().int().optional().nullable(),
  evolution_text: z.string().optional().nullable(),
  therapeutic_goals: z.string().optional().nullable(),
  internal_notes: z.string().optional().nullable(),
  interventions: z.string().optional().nullable(),
  observations: z.string().optional().nullable(),
});

export type RecordActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function createRecordAction(
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    patient_id: String(formData.get("patient_id") ?? ""),
    session_date: String(formData.get("session_date") ?? ""),
    session_number: formData.get("session_number") || null,
    evolution_text: String(formData.get("evolution_text") ?? "") || null,
    therapeutic_goals: String(formData.get("therapeutic_goals") ?? "") || null,
    internal_notes: String(formData.get("internal_notes") ?? "") || null,
    interventions: String(formData.get("interventions") ?? "") || null,
    observations: String(formData.get("observations") ?? "") || null,
  };

  const parsed = recordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patient_id)
    .eq("user_id", user.id)
    .single();

  if (!patient) return { error: "Paciente inválido." };

  // Auto-increment session number if not provided
  let sessionNumber = parsed.data.session_number;
  if (!sessionNumber) {
    const { count } = await supabase
      .from("clinical_records")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", parsed.data.patient_id)
      .eq("user_id", user.id);
    sessionNumber = (count ?? 0) + 1;
  }

  const { data, error } = await supabase
    .from("clinical_records")
    .insert({
      user_id: user.id,
      ...parsed.data,
      session_number: sessionNumber,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar o registro." };

  revalidatePath("/clinical-records");
  revalidatePath(`/patients/${parsed.data.patient_id}`);
  redirect(`/clinical-records/${data.id}`);
}

export async function updateRecordAction(
  id: string,
  _prev: RecordActionState,
  formData: FormData
): Promise<RecordActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    patient_id: String(formData.get("patient_id") ?? ""),
    session_date: String(formData.get("session_date") ?? ""),
    session_number: formData.get("session_number") || null,
    evolution_text: String(formData.get("evolution_text") ?? "") || null,
    therapeutic_goals: String(formData.get("therapeutic_goals") ?? "") || null,
    internal_notes: String(formData.get("internal_notes") ?? "") || null,
    interventions: String(formData.get("interventions") ?? "") || null,
    observations: String(formData.get("observations") ?? "") || null,
  };

  const parsed = recordSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  const { error } = await supabase
    .from("clinical_records")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar." };

  revalidatePath(`/clinical-records/${id}`);
  return { success: "Registro atualizado." };
}

export async function deleteRecordAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("clinical_records")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/clinical-records");
  return { success: "Registro excluído." };
}
