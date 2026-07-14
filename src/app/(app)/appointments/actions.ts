"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const appointmentSchema = z.object({
  patient_id: z.string().uuid("Selecione um paciente."),
  appointment_date: z.string().min(1, "Selecione a data."),
  appointment_time: z.string().min(1, "Selecione o horário."),
  duration_minutes: z.coerce.number().int().min(15).max(240).default(50),
  appointment_type: z.enum(["online", "presencial"]),
  price: z.coerce.number().min(0).default(0),
  status: z.enum(["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  notes: z.string().optional().nullable(),
});

export type AppointmentActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
  redirectTo?: string;
};

export async function createAppointmentAction(
  _prev: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    patient_id: String(formData.get("patient_id") ?? ""),
    appointment_date: String(formData.get("appointment_date") ?? ""),
    appointment_time: String(formData.get("appointment_time") ?? ""),
    duration_minutes: formData.get("duration_minutes") ?? 50,
    appointment_type: String(formData.get("appointment_type") ?? "presencial"),
    price: formData.get("price") ?? 0,
    status: String(formData.get("status") ?? "scheduled"),
    notes: String(formData.get("notes") ?? "") || null,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  // Verify patient belongs to user
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patient_id)
    .eq("user_id", user.id)
    .single();

  if (!patient) {
    return { error: "Paciente inválido." };
  }

  const { error, data } = await supabase
    .from("appointments")
    .insert({
      user_id: user.id,
      ...parsed.data,
    })
    .select("id")
    .single();

  if (error) return { error: "Não foi possível criar a consulta." };

  revalidatePath("/appointments");
  revalidatePath("/dashboard");
  return { success: "Consulta criada.", redirectTo: `/appointments/${data.id}` };
}

export async function updateAppointmentAction(
  id: string,
  _prev: AppointmentActionState,
  formData: FormData
): Promise<AppointmentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const raw = {
    patient_id: String(formData.get("patient_id") ?? ""),
    appointment_date: String(formData.get("appointment_date") ?? ""),
    appointment_time: String(formData.get("appointment_time") ?? ""),
    duration_minutes: formData.get("duration_minutes") ?? 50,
    appointment_type: String(formData.get("appointment_type") ?? "presencial"),
    price: formData.get("price") ?? 0,
    status: String(formData.get("status") ?? "scheduled"),
    notes: String(formData.get("notes") ?? "") || null,
  };

  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return { error: "Verifique os campos destacados.", fieldErrors };
  }

  const { error } = await supabase
    .from("appointments")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar." };

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  return { success: "Consulta atualizada." };
}

export async function updateAppointmentStatusAction(
  id: string,
  status: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar o status." };

  revalidatePath("/appointments");
  revalidatePath(`/appointments/${id}`);
  revalidatePath("/dashboard");
  return { success: "Status atualizado." };
}

export async function deleteAppointmentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/appointments");
  return { success: "Consulta excluída." };
}
