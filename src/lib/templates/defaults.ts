import { createClient } from "@/lib/supabase/server";

/**
 * Default templates that get inserted once per user, the first time they
 * access the app. Idempotent.
 */
const DEFAULT_TEMPLATES = [
  {
    name: "Declaração de Comparecimento",
    type: "declaration" as const,
    content: `DECLARAÇÃO DE COMPARECIMENTO

Declaro, para os devidos fins, que {{paciente_nome}}, portador(a) do documento de identidade {{paciente_documento}}, compareceu a sessão de atendimento psicológico realizada na data de {{data_sessao}}, no horário de {{horario_sessao}}, sob minha responsabilidade profissional.

{{cidade}}, {{data_atual}}.

_______________________________________________
{{psicologo_nome}}
Psicólogo(a) — CRP {{psicologo_crp}}
`,
    is_default: true,
  },
  {
    name: "Atestado de Comparecimento",
    type: "certificate" as const,
    content: `ATESTADO DE COMPARECIMENTO

Atesto, para os fins a que se destina, que o(a) paciente {{paciente_nome}} esteve em sessão de psicoterapia nesta data, {{data_sessao}}, no período de {{horario_sessao}}, perfazendo um total de {{duracao_sessao}} minutos de atendimento.

{{cidade}}, {{data_atual}}.

_______________________________________________
{{psicologo_nome}}
Psicólogo(a) — CRP {{psicologo_crp}}
`,
    is_default: true,
  },
  {
    name: "Encaminhamento Psicológico",
    type: "referral" as const,
    content: `ENCAMINHAMENTO

À(o) profissional/especialidade responsável,

Encaminho o(a) paciente {{paciente_nome}}, {{paciente_idade}} anos, para avaliação e acompanhamento especializado em {{especialidade_encaminhamento}}, considerando os aspectos observados no processo terapêutico atual.

Motivo do encaminhamento:
{{motivo_encaminhamento}}

Observações relevantes:
{{observacoes_gerais}}

Coloco-me à disposição para articulação do caso.

{{cidade}}, {{data_atual}}.

Atenciosamente,

_______________________________________________
{{psicologo_nome}}
Psicólogo(a) — CRP {{psicologo_crp}}
`,
    is_default: true,
  },
  {
    name: "Contrato de Prestação de Serviços Psicológicos",
    type: "contract" as const,
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS PSICOLÓGICOS

Pelo presente instrumento particular, de um lado {{psicologo_nome}}, psicólogo(a), inscrito(a) no CRP {{psicologo_crp}}, doravante denominado(a) PROFISSIONAL, e de outro lado {{paciente_nome}}, doravante denominado(a) PACIENTE, têm entre si justo e acordado o seguinte:

1. OBJETO
Prestação de serviços de psicoterapia pelo(a) PROFISSIONAL ao(à) PACIENTE.

2. VALORES E FORMA DE PAGAMENTO
O valor de cada sessão é de R$ {{valor_sessao}}, a ser pago {{forma_pagamento}}, no dia da sessão.

3. FREQUÊNCIA
Os atendimentos ocorrerão com frequência {{frequencia_sessao}}, em data e horário previamente agendados.

4. CONFIDENCIALIDADE
Todo o conteúdo das sessões é protegido pelo sigilo profissional, conforme Código de Ética do Psicólogo.

5. CANCELAMENTO
Cancelamentos devem ser comunicados com antecedência mínima de 24 horas.

6. RESCISÃO
Qualquer das partes pode rescindir este contrato a qualquer momento, mediante comunicação prévia.

E por estarem assim justas e contratadas, as partes assinam o presente.

{{cidade}}, {{data_atual}}.


_______________________________     _______________________________
{{psicologo_nome}}                              {{paciente_nome}}
CRP {{psicologo_crp}}
`,
    is_default: true,
  },
  {
    name: "Relatório Psicológico",
    type: "report" as const,
    content: `RELATÓRIO PSICOLÓGICO

1. IDENTIFICAÇÃO
Paciente: {{paciente_nome}}
Idade: {{paciente_idade}}
Data do relatório: {{data_atual}}

2. DEMANDA
{{demanda_relatorio}}

3. PROCEDIMENTOS UTILIZADOS
{{procedimentos_utilizados}}

4. OBSERVAÇÕES CLÍNICAS
{{observacoes_clinicas}}

5. CONSIDERAÇÕES FINAIS
{{consideracoes_finais}}

_______________________________________________
{{psicologo_nome}}
Psicólogo(a) — CRP {{psicologo_crp}}
`,
    is_default: true,
  },
];

export async function ensureDefaultTemplates(userId: string) {
  const supabase = await createClient();

  // Check if user already has default templates
  const { data: existing } = await supabase
    .from("document_templates")
    .select("id")
    .eq("user_id", userId)
    .eq("is_default", true)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from("document_templates").insert(
    DEFAULT_TEMPLATES.map((t) => ({
      ...t,
      user_id: userId,
    }))
  );
}
