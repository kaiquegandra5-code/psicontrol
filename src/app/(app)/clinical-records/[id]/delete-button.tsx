"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRecordAction } from "../actions";
import { toast } from "@/components/ui/toaster";

export function DeleteRecordButton({ id, patientId }: { id: string; patientId: string }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    if (!confirm("Excluir este registro clínico? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    const result = await deleteRecordAction(id);
    setLoading(false);
    if (result?.error) {
      toast.error("Erro", result.error);
    } else {
      toast.success("Registro excluído");
      router.push(`/patients/${patientId}`);
    }
  }

  return (
    <Button
      variant="outline"
      leftIcon={<Trash2 className="h-4 w-4" />}
      onClick={handleDelete}
      isLoading={loading}
      className="text-error hover:text-error hover:bg-error/5"
    >
      Excluir
    </Button>
  );
}
