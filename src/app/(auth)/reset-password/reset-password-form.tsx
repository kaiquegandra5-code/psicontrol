"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Lock, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" isLoading={pending}>
      Redefinir senha
    </Button>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await resetPasswordAction(formData);
    if (result?.error) setError(result.error);
    if (result?.success) {
      setSuccess(result.success);
      setTimeout(() => router.push("/dashboard"), 800);
    }
  }

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-headline-md font-heading">Psiorganizer</span>
      </div>

      <div className="mb-8">
        <h1 className="text-headline-lg font-heading">Criar nova senha</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Sua nova senha deve ter pelo menos 12 caracteres.
        </p>
      </div>

      <form action={action} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/5 p-3 text-body-sm text-error">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-tertiary/30 bg-tertiary/5 p-3 text-body-sm text-tertiary">
            {success}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 12 caracteres"
            required
            minLength={12}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar nova senha</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="Digite novamente"
            required
            minLength={12}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
