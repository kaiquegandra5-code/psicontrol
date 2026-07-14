import { Header } from "@/components/layout/header";
import { DocumentGenerator } from "../document-generator";

export const metadata = {
  title: "Gerar documento",
};

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: Promise<{ patient_id?: string }>;
}) {
  const { patient_id } = await searchParams;
  return (
    <>
      <Header title="Gerar documento" subtitle="Preencha os dados e gere um PDF profissional." />
      <div className="px-8 py-8 max-w-4xl">
        <DocumentGenerator initialPatientId={patient_id} />
      </div>
    </>
  );
}
