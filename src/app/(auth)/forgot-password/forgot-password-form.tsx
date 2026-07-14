"use client";

import * as React from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Mail, ArrowLeft, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { forgotPasswordAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" isLoading={pending}>
      Enviar link de recuperação
    </Button>
  );
}

export function ForgotPasswordForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await forgotPasswordAction(formData);
    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(result.success);
  }

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-headline-md font-heading">Psiorganizer</span>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-on-surface mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o login
      </Link>

      <div className="mb-8">
        <h1 className="text-headline-lg font-heading">Recuperar senha</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Enviaremos um link para o seu e-mail para redefinir sua senha.
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
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
