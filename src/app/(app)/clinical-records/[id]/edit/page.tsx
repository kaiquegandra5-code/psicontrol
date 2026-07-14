import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { RecordForm } from "../../record-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar evolução",
};

export default async function EditRecordPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from("clinical_records")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!record) notFound();

  return (
    <>
      <Header title="Editar evolução" subtitle="Atualize as informações deste registro." />
      <div className="px-8 py-8 max-w-3xl">
        <RecordForm record={record} defaultPatientId={record.patient_id} />
      </div>
    </>
  );
}
