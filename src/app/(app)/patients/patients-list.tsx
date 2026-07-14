"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { formatDate, ageFromBirthDate } from "@/lib/utils/format";
import { formatPhone } from "@/lib/utils/validators";
import { toast } from "@/components/ui/toaster";
import { deletePatientAction } from "./actions";
import type { Patient } from "@/types/database";

const PAGE_SIZE = 10;

const statusMap = {
  active: { label: "Ativo", variant: "success" as const },
  inactive: { label: "Inativo", variant: "neutral" as const },
  archived: { label: "Arquivado", variant: "outline" as const },
};

export function PatientsList() {
  const router = useRouter();
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  const fetchPatients = React.useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("patients")
      .select("*", { count: "exact" })
      .order("full_name", { ascending: true })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search}%,cpf.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;
    if (error) {
      toast.error("Erro", "Não foi possível carregar os pacientes.");
    } else {
      setPatients(data ?? []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [search, page]);

  React.useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Excluir o paciente ${name}? Esta ação não pode ser desfeita.`)) return;
    const result = await deletePatientAction(id);
    if (result?.error) {
      toast.error("Erro", result.error);
    } else {
      toast.success("Paciente excluído");
      fetchPatients();
    }
  }

  return (
    <>
      <Header
        title="Pacientes"
        subtitle={`${totalCount} ${totalCount === 1 ? "paciente cadastrado" : "pacientes cadastrados"}`}
        action={{ label: "Novo paciente", href: "/patients/new", icon: <Plus className="h-4 w-4" /> }}
      />
      <div className="px-8 py-8 space-y-6">
        <div className="flex items-center gap-3 max-w-md">
          <SearchInput
            placeholder="Buscar por nome, CPF, e-mail…"
            value={search}
            onSearch={(v) => {
              setPage(1);
              setSearch(v);
            }}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : patients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={search ? "Nenhum paciente encontrado" : "Você ainda não tem pacientes"}
            description={
              search
                ? "Tente uma busca diferente."
                : "Adicione seu primeiro paciente para começar a usar o Psiorganizer."
            }
            action={
              !search && (
                <Button leftIcon={<Plus className="h-4 w-4" />} asChild>
                  <Link href="/patients/new">Adicionar paciente</Link>
                </Button>
              )
            }
          />
        ) : (
          <>
            <Card elevation={1} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-container-lowest">
                    <tr>
                      <th className="px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Idade
                      </th>
                      <th className="px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Cadastrado
                      </th>
                      <th className="px-6 py-3 text-right text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-divider">
                    {patients.map((p) => {
                      const s = statusMap[p.status as keyof typeof statusMap];
                      const age = ageFromBirthDate(p.birth_date);
                      return (
                        <tr key={p.id} className="hover:bg-surface-container-lowest/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-primary text-label-sm shrink-0">
                                {p.full_name
                                  .split(" ")
                                  .slice(0, 2)
                                  .map((s) => s[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-label-md text-on-surface truncate">{p.full_name}</p>
                                {p.cpf && (
                                  <p className="text-body-sm text-on-surface-variant font-mono">
                                    {p.cpf}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-body-sm text-on-surface">
                              {p.phone ? formatPhone(p.phone) : "—"}
                            </p>
                            <p className="text-body-sm text-on-surface-variant truncate">
                              {p.email ?? "—"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-body-sm text-on-surface">
                            {age !== null ? `${age} anos` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={s.variant}>{s.label}</Badge>
                          </td>
                          <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                            {formatDate(p.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => router.push(`/patients/${p.id}`)}
                                title="Ver detalhes"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => router.push(`/patients/${p.id}/edit`)}
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDelete(p.id, p.full_name)}
                                title="Excluir"
                                className="text-on-surface-variant hover:text-error hover:bg-error/5"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
