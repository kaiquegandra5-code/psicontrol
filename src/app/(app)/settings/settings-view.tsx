"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Save, User } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";
import { updateProfileAction, type ProfileActionState } from "./actions";
import type { Profile } from "@/types/database";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} leftIcon={<Save className="h-4 w-4" />}>
      Salvar alterações
    </Button>
  );
}

export function SettingsView() {
  const action = async (
    _prev: ProfileActionState,
    formData: FormData
  ): Promise<ProfileActionState> => {
    return updateProfileAction(_prev, formData);
  };
  const [state, formAction] = useActionState<ProfileActionState, FormData>(action, {});

  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  React.useEffect(() => {
    if (state?.error) toast.error("Erro", state.error);
    if (state?.success) toast.success("Perfil atualizado");
  }, [state]);

  if (loading) {
    return (
      <>
        <Header title="Configurações" />
        <div className="px-8 py-8">Carregando…</div>
      </>
    );
  }

  return (
    <>
      <Header title="Configurações" subtitle="Gerencie seu perfil profissional" />
      <div className="px-8 py-8 max-w-2xl space-y-6">
        <form action={formAction} className="space-y-6">
          <Card elevation={2}>
            <CardHeader>
              <CardTitle>Dados profissionais</CardTitle>
              <CardDescription>Estes dados aparecerão nos seus documentos gerados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-outline-variant/40">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-headline-md shrink-0">
                  {(profile?.full_name ?? "U")
                    .split(" ")
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-label-md text-on-surface">{profile?.full_name}</p>
                  <p className="text-body-sm text-on-surface-variant">{profile?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crp">CRP</Label>
                  <Input
                    id="crp"
                    name="crp"
                    defaultValue={profile?.crp ?? ""}
                    placeholder="00/00000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    defaultValue={profile?.specialty ?? ""}
                    placeholder="Ex: Psicóloga Clínica"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>

        <Card elevation={1}>
          <CardHeader>
            <CardTitle>Conta</CardTitle>
            <CardDescription>Seu e-mail de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-body-md text-on-surface">{profile?.email}</p>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Para alterar seu e-mail ou senha, use a opção "Esqueci minha senha" na tela de login.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
