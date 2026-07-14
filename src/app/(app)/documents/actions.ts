"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fillTemplate, generateClinicalPdf } from "@/lib/pdf/generator";
import { ageFromBirthDate, formatDate, formatTime } from "@/lib/utils/format";

export type DocumentActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

interface GenerateArgs {
  templateId: string;
  patientId: string;
  extraValues?: Record<string, string>;
  title: string;
}

/**
 * Generates a PDF from a template, uploads it to Supabase Storage,
 * and stores metadata in `generated_documents`.
 */
export async function generateDocumentAction(
  args: GenerateArgs
): Promise<DocumentActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  // Fetch template
  const { data: template } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", args.templateId)
    .eq("user_id", user.id)
    .single();

  if (!template) return { error: "Modelo não encontrado." };

  // Fetch patient
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", args.patientId)
    .eq("user_id", user.id)
    .single();

  if (!patient) return { error: "Paciente inválido." };

  // Fetch psychologist profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Build placeholder values
  const now = new Date();
  const values: Record<string, string> = {
    paciente_nome: patient.full_name,
    paciente_documento: patient.cpf ?? "",
    paciente_idade:
      ageFromBirthDate(patient.birth_date) !== null
        ? String(ageFromBirthDate(patient.birth_date))
        : "",
    paciente_telefone: patient.phone ?? "",
    paciente_email: patient.email ?? "",
    paciente_endereco: patient.address ?? "",
    psicologo_nome: profile?.full_name ?? "",
    psicologo_crp: profile?.crp ?? "",
    psicologo_especialidade: profile?.specialty ?? "",
    psicologo_telefone: profile?.phone ?? "",
    cidade: "São Paulo",
    data_atual: now.toLocaleDateString("pt-BR"),
    data_sessao: formatDate(now),
    horario_sessao: formatTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`),
    duracao_sessao: "50",
    ...args.extraValues,
  };

  const filledContent = fillTemplate(template.content, values);

  // Generate PDF
  const pdfBytes = await generateClinicalPdf({
    title: args.title,
    content: filledContent,
    authorName: profile?.full_name,
    authorCrp: profile?.crp,
    patientName: patient.full_name,
  });

  // Upload to storage
  const admin = createAdminClient();
  const fileName = `${user.id}/${args.patientId}/${Date.now()}-${template.type}.pdf`;
  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(fileName, pdfBytes, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    return { error: `Erro no upload: ${uploadError.message}` };
  }

  // Get public URL (still private, but we use a signed URL on demand)
  const { data: urlData } = admin.storage
    .from("documents")
    .getPublicUrl(fileName);

  // Persist record
  const { error: insertError } = await supabase.from("generated_documents").insert({
    user_id: user.id,
    patient_id: args.patientId,
    template_id: args.templateId,
    title: args.title,
    content: filledContent,
    pdf_url: urlData.publicUrl,
    document_type: template.type,
  });

  if (insertError) {
    return { error: "Não foi possível salvar o documento." };
  }

  revalidatePath("/documents");
  revalidatePath(`/patients/${args.patientId}`);
  return { success: "Documento gerado com sucesso." };
}

export async function deleteDocumentAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: doc } = await supabase
    .from("generated_documents")
    .select("pdf_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (doc?.pdf_url) {
    // Best-effort delete from storage
    const admin = createAdminClient();
    const url = new URL(doc.pdf_url);
    const path = url.pathname.split("/storage/v1/object/public/documents/")[1];
    if (path) {
      await admin.storage.from("documents").remove([path]);
    }
  }

  const { error } = await supabase
    .from("generated_documents")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/documents");
  return { success: "Documento excluído." };
}

export async function getSignedDocumentUrlAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: doc } = await supabase
    .from("generated_documents")
    .select("pdf_url, title")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!doc?.pdf_url) return { error: "Documento não encontrado." };

  const admin = createAdminClient();
  const url = new URL(doc.pdf_url);
  const path = url.pathname.split("/storage/v1/object/public/documents/")[1];
  if (!path) return { error: "Caminho inválido." };

  const { data, error } = await admin.storage
    .from("documents")
    .createSignedUrl(path, 60 * 60); // 1h

  if (error || !data) return { error: "Não foi possível gerar o link." };

  redirect(data.signedUrl);
}

// Templates CRUD
export async function createTemplateAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as
    | "declaration"
    | "certificate"
    | "referral"
    | "contract"
    | "report"
    | "other";
  const content = String(formData.get("content") ?? "").trim();

  if (!name || !content) return { error: "Preencha nome e conteúdo." };

  const { error } = await supabase.from("document_templates").insert({
    user_id: user.id,
    name,
    type,
    content,
  });

  if (error) return { error: "Não foi possível criar o modelo." };

  revalidatePath("/documents/templates");
  return { success: "Modelo criado." };
}

export async function updateTemplateAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "other") as
    | "declaration"
    | "certificate"
    | "referral"
    | "contract"
    | "report"
    | "other";
  const content = String(formData.get("content") ?? "").trim();

  if (!name || !content) return { error: "Preencha nome e conteúdo." };

  const { error } = await supabase
    .from("document_templates")
    .update({ name, type, content })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível atualizar." };

  revalidatePath("/documents/templates");
  revalidatePath(`/documents/templates/${id}`);
  return { success: "Modelo atualizado." };
}

export async function deleteTemplateAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("document_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Não foi possível excluir." };

  revalidatePath("/documents/templates");
  return { success: "Modelo excluído." };
}
