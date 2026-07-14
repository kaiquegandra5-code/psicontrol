import { Header } from "@/components/layout/header";
import { RecordForm } from "../record-form";

export const metadata = {
  title: "Nova evolução",
};

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  return (
    <>
      <Header title="Nova evolução" subtitle="Registre uma nova evolução clínica." />
      <div className="px-8 py-8 max-w-3xl">
        <RecordForm initialPatientId={patient_id} />
      </div>
    </>
  );
}
