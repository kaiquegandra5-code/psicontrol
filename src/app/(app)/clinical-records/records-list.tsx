"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FileText, Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/format";

export function ClinicalRecordsList() {
  const router = useRouter();
  const [records, setRecords] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const fetch = React.useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("clinical_records")
      .select("*, patient:patients(id, full_name)")
      .order("session_date", { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (!error) {
      let filtered = data ?? [];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.patient?.full_name?.toLowerCase().includes(q) ||
            r.evolution_text?.toLowerCase().includes(q)
        );
      }
      setRecords(filtered);
    }
    setLoading(false);
  }, [search]);

  React.useEffect(() => {
    fetch();
  }, [fetch]);

  // Group by patient
  const grouped = React.useMemo(() => {
    const map = new Map<string, { name: string; id: string; items: any[] }>();
    for (const r of records) {
      const id = r.patient?.id ?? "unknown";
      const name = r.patient?.full_name ?? "Paciente";
      if (!map.has(id)) map.set(id, { name, id, items: [] });
      map.get(id)!.items.push(r);
    }
    return Array.from(map.values());
  }, [records]);

  return (
    <>
      <Header
        title="Prontuários"
        subtitle="Histórico de evoluções clínicas"
        action={{ label: "Nova evolução", href: "/clinical-records/new", icon: <Plus className="h-4 w-4" /> }}
      />
      <div className="px-8 py-8 space-y-6">
        <div className="max-w-md">
          <SearchInput
            placeholder="Buscar por paciente ou conteúdo…"
            value={search}
            onSearch={setSearch}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6" />
          </div>
        ) : grouped.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={search ? "Nenhuma evolução encontrada" : "Nenhuma evolução registrada"}
            description={search ? "Tente uma busca diferente." : "Comece registrando a primeira evolução clínica."}
            action={
              !search && (
                <Button leftIcon={<Plus className="h-4 w-4" />} asChild>
                  <Link href="/clinical-records/new">Criar evolução</Link>
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.id}>
                <Link
                  href={`/patients/${group.id}`}
                  className="flex items-center gap-3 mb-3 group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/8 text-primary text-label-sm shrink-0">
                    {group.name
                      .split(" ")
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      {group.name}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {group.items.length}{" "}
                      {group.items.length === 1 ? "evolução" : "evoluções"}
                    </p>
                  </div>
                </Link>
                <Card elevation={1} className="overflow-hidden">
                  <ul className="divide-y divide-divider">
                    {group.items.map((r) => (
                      <li
                        key={r.id}
                        onClick={() => router.push(`/clinical-records/${r.id}`)}
                        className="px-5 py-4 cursor-pointer hover:bg-surface-container-lowest/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {r.session_number && (
                              <Badge variant="neutral">#{r.session_number}</Badge>
                            )}
                            <p className="text-label-md text-on-surface">
                              Sessão de {formatDate(r.session_date)}
                            </p>
                          </div>
                          <p className="text-body-sm text-on-surface-variant">
                            {formatDate(r.created_at)}
                          </p>
                        </div>
                        {r.evolution_text && (
                          <p className="mt-2 text-body-sm text-on-surface-variant line-clamp-2 clinical-text">
                            {r.evolution_text}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
