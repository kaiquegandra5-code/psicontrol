import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { PatientForm } from "../../patient-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar paciente",
};

export default async function EditPatientPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!patient) notFound();

  return (
    <>
      <Header title="Editar paciente" subtitle={patient.full_name} />
      <div className="px-8 py-8">
        <PatientForm patient={patient} />
      </div>
    </>
  );
}
