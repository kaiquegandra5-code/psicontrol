"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateAppointmentStatusAction } from "../actions";
import { toast } from "@/components/ui/toaster";
import type { Appointment } from "@/types/database";

export function AppointmentStatusButtons({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: Appointment["status"];
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function setStatus(status: Appointment["status"]) {
    setLoading(status);
    const result = await updateAppointmentStatusAction(id, status);
    setLoading(null);
    if (result?.error) toast.error("Erro", result.error);
    else {
      toast.success("Status atualizado");
      router.refresh();
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={currentStatus === "completed" ? "tertiary" : "outline"}
        leftIcon={<Check className="h-4 w-4" />}
        onClick={() => setStatus("completed")}
        isLoading={loading === "completed"}
        disabled={currentStatus === "completed"}
      >
        Concluir
      </Button>
      <Button
        variant={currentStatus === "no_show" ? "outline" : "outline"}
        leftIcon={<AlertTriangle className="h-4 w-4" />}
        onClick={() => setStatus("no_show")}
        isLoading={loading === "no_show"}
        disabled={currentStatus === "no_show"}
      >
        Marcou falta
      </Button>
      <Button
        variant={currentStatus === "cancelled" ? "outline" : "outline"}
        leftIcon={<X className="h-4 w-4" />}
        onClick={() => setStatus("cancelled")}
        isLoading={loading === "cancelled"}
        disabled={currentStatus === "cancelled"}
        className="text-error hover:text-error"
      >
        Cancelar
      </Button>
      <Button
        variant="ghost"
        leftIcon={<RotateCcw className="h-4 w-4" />}
        onClick={() => setStatus("scheduled")}
        isLoading={loading === "scheduled"}
        disabled={currentStatus === "scheduled"}
      >
        Reagendar
      </Button>
    </div>
  );
}
