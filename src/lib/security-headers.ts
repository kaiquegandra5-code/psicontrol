import type { NextResponse } from "next/server";

/**
 * Fonte única dos cabeçalhos de segurança HTTP.
 * Reaproveitado por next.config.ts (assets estáticos) e pelo proxy/middleware
 * (respostas 307 e páginas servidas por ele).
 *
 * NOTA DE CSP (ACH-01): `script-src` mantém 'unsafe-inline' porque o Next.js
 * 16.2.10 (App Router) NÃO aplica automaticamente o nonce do CSP aos <script>
 * inline do RSC (self.__next_f.push). Remover 'unsafe-inline' sem um mecanismo
 * de nonce funcional bloqueia esses scripts e quebra a hidratação do app.
 * Ver relatório de auditoria (seção "CSP Hardening") para o caminho correto.
 */
export const SECURITY_HEADERS: { key: string; value: string }[] = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.supabase.co https://*.vercel-storage.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

export function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const { key, value } of SECURITY_HEADERS) {
    response.headers.set(key, value);
  }
  return response;
}
