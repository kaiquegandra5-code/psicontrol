import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TemplateEditor } from "./template-editor";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar modelo",
};

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: template } = await supabase
    .from("document_templates")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!template) notFound();

  return (
    <>
      <Header title="Editar modelo" subtitle={template.name} />
      <div className="px-8 py-8 max-w-4xl">
        <TemplateEditor template={template} />
      </div>
    </>
  );
}
