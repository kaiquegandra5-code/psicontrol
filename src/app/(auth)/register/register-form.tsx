"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Mail, Lock, User, ArrowRight, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { registerAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" isLoading={pending} rightIcon={!pending ? <ArrowRight className="h-4 w-4" /> : undefined}>
      Criar conta
    </Button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await registerAction(formData);
    if (result?.error) {
      setError(result.error);
      return;
    }
    // If signUp returns a session, the server action already redirected to /dashboard.
    // If we get a success message here, it means email confirmation is required
    // (no session yet). Show the message and redirect to login after a delay.
    setSuccess(result?.success ?? "Conta criada! Verifique seu e-mail.");
    setTimeout(() => router.push("/login"), 3000);
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
        <h1 className="text-headline-lg font-heading">Crie sua conta</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Comece a organizar sua prática clínica em minutos.
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
            {success} Redirecionando…
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Dra. Maria Silva"
            required
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail profissional</Label>
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

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 12 caracteres"
            required
            autoComplete="new-password"
            minLength={12}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirmar senha</Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            placeholder="Digite a senha novamente"
            required
            autoComplete="new-password"
            minLength={12}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <SubmitButton />

        <p className="text-body-sm text-on-surface-variant text-center">
          Ao criar uma conta, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </form>

      <p className="mt-6 text-center text-body-sm text-on-surface-variant">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
