import { Header } from "@/components/layout/header";
import { AppointmentForm } from "../appointment-form";

export const metadata = {
  title: "Nova consulta",
};

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  return (
    <>
      <Header title="Nova consulta" subtitle="Agende uma nova consulta na sua agenda." />
      <div className="px-8 py-8">
        <AppointmentForm initialPatientId={patient_id} />
      </div>
    </>
  );
}
