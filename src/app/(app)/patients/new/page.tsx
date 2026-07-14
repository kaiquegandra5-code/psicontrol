import { Header } from "@/components/layout/header";
import { PatientForm } from "../patient-form";

export const metadata = {
  title: "Novo paciente",
};

export default function NewPatientPage() {
  return (
    <>
      <Header title="Novo paciente" subtitle="Adicione um novo paciente ao seu consultório." />
      <div className="px-8 py-8">
        <PatientForm />
      </div>
    </>
  );
}
