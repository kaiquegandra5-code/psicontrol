import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/queries";
import { AppShell } from "@/components/layout/app-shell";
import { ensureDefaultTemplates } from "@/lib/templates/defaults";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const result = await getCurrentUser();
  if (!result?.user) redirect("/login");

  // Ensure default templates exist (no-op after first run)
  await ensureDefaultTemplates(result.user.id);

  return (
    <AppShell
      user={{
        full_name: result.profile?.full_name ?? "Usuário",
        email: result.profile?.email ?? result.user.email ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
