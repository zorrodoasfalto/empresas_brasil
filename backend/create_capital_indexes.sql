-- Índices para otimização de consultas por capital social
-- Criado para resolver timeout em consultas ordenadas por capital social

-- 1. Índice para capital_social (conversão numérica)
-- Este índice acelera ordenações por capital social
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_capital_social_numeric
ON empresas ((CASE 
    WHEN capital_social ~ '^[0-9]+\.?[0-9]*$' 
    THEN capital_social::NUMERIC 
    ELSE 0 
END))
WHERE capital_social IS NOT NULL 
AND capital_social ~ '^[0-9]+' 
AND capital_social::NUMERIC >= 1000;

-- 2. Índice para consultas "com contatos"
-- Este índice acelera filtros de empresas com telefone/email
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estabelecimentos_contatos
ON estabelecimentos (correio_eletronico, telefone1)
WHERE (correio_eletronico IS NOT NULL AND correio_eletronico != '')
   OR (telefone1 IS NOT NULL AND telefone1 != '');

-- 3. Índice para consultas "sem contatos"
-- Este índice acelera filtros de empresas sem telefone/email  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estabelecimentos_sem_contatos
ON estabelecimentos (cnpj_basico)
WHERE (correio_eletronico IS NULL OR correio_eletronico = '')
  AND (telefone1 IS NULL OR telefone1 = '');

-- 4. Índice composto para UF + CNAE (transportadoras)
-- Este índice acelera consultas por estado e segmento
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estabelecimentos_uf_cnae
ON estabelecimentos (uf, cnae_fiscal)
WHERE cnae_fiscal = ANY(ARRAY['4930201', '4930202', '5320202', '5229099']);

-- 5. Índice para CNPJ básico (JOIN otimizado)
-- Este índice acelera o JOIN entre estabelecimentos e empresas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_estabelecimentos_cnpj_basico
ON estabelecimentos (cnpj_basico);

-- Mensagem de conclusão
SELECT 'Índices para capital social criados com sucesso!' as status;