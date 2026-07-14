/**
 * Validates a Brazilian CPF (format + check digits).
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10) first = 0;
  if (first !== parseInt(cleaned[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10) second = 0;
  if (second !== parseInt(cleaned[10])) return false;

  return true;
}

export function formatCPF(cpf: string): string {
  const c = cpf.replace(/\D/g, "").slice(0, 11);
  if (c.length <= 3) return c;
  if (c.length <= 6) return `${c.slice(0, 3)}.${c.slice(3)}`;
  if (c.length <= 9) return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6)}`;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

export function formatPhone(phone: string): string {
  const p = phone.replace(/\D/g, "").slice(0, 11);
  if (p.length <= 2) return p;
  if (p.length <= 6) return `(${p.slice(0, 2)}) ${p.slice(2)}`;
  if (p.length <= 10) return `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}`;
  return `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}`;
}
