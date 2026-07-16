-- =====================================================
-- PSIORGANIZER - VERIFICAÇÃO DE RLS / STORAGE (READ-ONLY)
-- =====================================================
-- OBJETIVO: confirmar em PRODUÇÃO que as políticas de segurança
--           estão APLICADAS e CORRETAS (o schema.sql/storage.sql
--           são scripts manuais e podem não ter sido executados).
-- SEGURO:  contém apenas SELECTs. Não altera nada.
-- COMO:    Supabase Dashboard > SQL Editor > colar > Run.
-- =====================================================

-- -------------------------------------------------------
-- 1) RLS HABILITADO EM CADA TABELA
--    Esperado: rls_enabled = t para TODAS as 6 tabelas.
--    Se alguma for 'f' => CRÍTICO (tabela sem proteção).
-- -------------------------------------------------------
SELECT
  c.relname                                                              AS table_name,
  c.relrowsecurity                                                      AS rls_enabled,
  CASE WHEN c.relrowsecurity THEN 'OK' ELSE 'CRITICO: RLS DESLIGADO' END AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
        'profiles','patients','appointments',
        'clinical_records','document_templates','generated_documents'
      )
ORDER BY c.relname;

-- -------------------------------------------------------
-- 2) TODAS AS POLÍTICAS RLS (checagem central)
--    Esperado: cada tabela tem policies de SELECT/INSERT/
--    UPDATE/DELETE com USING/WITH CHECK = auth.uid() = ...
-- -------------------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual       AS using_expr,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- -------------------------------------------------------
-- 3) BUCKETS DE STORAGE (público x privado)
--    Esperado: 'documents' public=f ; 'avatars' public=t.
-- -------------------------------------------------------
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- -------------------------------------------------------
-- 4) POLÍTICAS DE STORAGE
--    Esperado: documents com foldername(name)[1]=auth.uid();
--    avatars leitura TO public apenas no bucket 'avatars'.
-- -------------------------------------------------------
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- -------------------------------------------------------
-- 5) VARREDURA DE PERIGO - TABELAS (IDOR / ACESSO CRUZADO)
--    Qualquer policy SELECT em tabela sensível SEM
--    auth.uid() na cláusula USING => leitura cross-tenant.
--    Retornar linhas AQUI = CRÍTICO.
-- -------------------------------------------------------
SELECT
  tablename,
  policyname,
  cmd,
  qual                                                            AS using_expr,
  'POLICY SEM auth.uid() (possível vazamento cross-tenant)'       AS finding
FROM pg_policies
WHERE schemaname = 'public'
  AND cmd = 'SELECT'
  AND (qual IS NULL OR qual NOT ILIKE '%auth.uid()%')
ORDER BY tablename;

-- -------------------------------------------------------
-- 6) VARREDURA DE PERIGO - STORAGE (BUCKET PRIVADO PÚBLICO)
--    Policy em storage.objects concedida à role 'public'
--    cujo qual cita o bucket 'documents' => CRÍTICO.
-- -------------------------------------------------------
SELECT
  tablename,
  policyname,
  roles,
  qual,
  'LEITURA PÚBLICA NO BUCKET documents (CRÍTICO)'                  AS finding
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND roles && ARRAY['public']::text[]
  AND qual ILIKE '%documents%'
ORDER BY policyname;

-- -------------------------------------------------------
-- 7) RESUMO - CONTAGEM DE POLÍCIAS POR TABELA
--    Esperado: 4 políticas (SELECT/INSERT/UPDATE/DELETE)
--    por tabela de dados (perfis tem 4 também).
-- -------------------------------------------------------
SELECT
  tablename,
  COUNT(*)                                                       AS policy_count,
  COUNT(*) FILTER (WHERE cmd = 'SELECT')                         AS selects,
  COUNT(*) FILTER (WHERE cmd = 'INSERT')                         AS inserts,
  COUNT(*) FILTER (WHERE cmd = 'UPDATE')                         AS updates,
  COUNT(*) FILTER (WHERE cmd = 'DELETE')                         AS deletes
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- INTERPRETAÇÃO RÁPIDA:
--  - Seção 1: todas as linhas devem ser 'OK'.
--  - Seção 5: deve retornar 0 linhas.
--  - Seção 6: deve retornar 0 linhas.
--  - Seção 7: cada tabela deve ter 4 políticas.
--  Qualquer desvio acima = corrigir aplicando schema.sql
--  e storage.sql no SQL Editor (ou via supabase db push).
-- =====================================================
