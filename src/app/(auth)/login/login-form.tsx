"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Mail, Lock, ArrowRight, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { loginAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" isLoading={pending} rightIcon={!pending ? <ArrowRight className="h-4 w-4" /> : undefined}>
      Entrar
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const [error, setError] = React.useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <span className="text-headline-md font-heading">Psiorganizer</span>
      </div>

      <div className="mb-8">
        <h1 className="text-headline-lg font-heading">Bem-vindo de volta</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Entre com sua conta para acessar seu consultório digital.
        </p>
      </div>

      <form action={action} className="space-y-5">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/5 p-3 text-body-sm text-error">
            {error}
          </div>
        )}

        <input type="hidden" name="redirectTo" value={redirectTo} />

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link
              href="/forgot-password"
              className="text-body-sm text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>

        <SubmitButton />
      </form>

      <p className="mt-8 text-center text-body-sm text-on-surface-variant">
        Ainda não tem uma conta?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          Criar conta gratuita
        </Link>
      </p>
    </div>
  );
}
