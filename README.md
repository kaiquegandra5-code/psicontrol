# Psiorganizer

Plataforma SaaS completa para psicólogos autônomos gerenciarem pacientes, prontuários, agenda e documentos clínicos.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** com design system customizado
- **Supabase** (PostgreSQL, Auth, Storage)
- **Server Actions** para mutações
- **pdf-lib** para geração de PDFs
- **react-hook-form + zod** para validação
- **date-fns + lucide-react**

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Copie `.env.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
   SUPABASE_SERVICE_ROLE_KEY=xxxxx
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Rodar o schema SQL

No SQL Editor do Supabase, execute **em ordem**:

1. `supabase/schema.sql` — tabelas, RLS, triggers, profile auto-criado, templates padrão
2. `supabase/storage.sql` — buckets e policies de storage

### 4. Desabilitar confirmação de e-mail (opcional, para dev)

Em Authentication → Providers → Email, desative "Confirm email" para que o signup faça login automaticamente.

### 5. Rodar o app

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura

```
src/
├── app/
│   ├── (auth)/         # Login, registro, recuperação de senha
│   ├── (app)/          # Rotas autenticadas
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── clinical-records/
│   │   ├── documents/
│   │   └── settings/
│   └── auth/callback/  # OAuth callback do Supabase
├── components/
│   ├── ui/             # Componentes base (Button, Card, Modal, etc)
│   └── layout/         # AppShell, Sidebar, Header
├── lib/
│   ├── supabase/       # Clientes Supabase (browser, server, admin, middleware)
│   ├── pdf/            # Geração de PDF
│   ├── templates/      # Templates padrão
│   └── utils/          # cn, format, validators
├── types/
│   └── database.ts     # Tipos do Supabase
└── middleware.ts       # Proteção de rotas + refresh de sessão
```

## Segurança

- **RLS** em todas as tabelas — usuários só acessam seus próprios dados
- **Storage policies** garantindo isolamento por usuário (`auth.uid() = user_id`)
- Middleware autenticando todas as rotas privadas
- Validação **zod** em todos os server actions
- CPF, telefone e dados sensíveis validados/mascarados

## Deploy na Vercel

1. Suba o projeto para o GitHub
2. Importe na Vercel
3. Configure as variáveis de ambiente do Supabase
4. Deploy!

## Funcionalidades

- ✅ Cadastro, login, logout, recuperação de senha
- ✅ Dashboard com estatísticas e próximas consultas
- ✅ CRUD de pacientes com busca, paginação, validação de CPF
- ✅ Agenda com filtros por status e data
- ✅ Status de consulta (agendada, concluída, cancelada, falta)
- ✅ Prontuário com evolução, objetivos, intervenções, notas internas
- ✅ Documentos: declaração, atestado, encaminhamento, contrato, relatório
- ✅ Geração de PDF profissional com template variables
- ✅ Storage privado no Supabase com URLs assinadas
- ✅ Templates personalizáveis
- ✅ Multi-tenant: cada usuário vê apenas seus dados
- ✅ Design system premium (paleta "Psychological Safety", tipografia Geist/Inter)
