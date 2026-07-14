import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { AppointmentForm } from "../../appointment-form";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Editar consulta",
};

export default async function EditAppointmentPage({ params }: PageProps) {
  const { id } = await params;
  const { user } = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!appointment) notFound();

  return (
    <>
      <Header title="Editar consulta" subtitle={`${appointment.patient_id.slice(0, 8)}…`} />
      <div className="px-8 py-8">
        <AppointmentForm appointment={appointment} defaultPatientId={appointment.patient_id} />
      </div>
    </>
  );
}
