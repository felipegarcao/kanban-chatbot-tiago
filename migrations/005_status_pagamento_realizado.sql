-- 2 novos status no fluxo financeiro:
--
--   pagamento_aprovado  -- escrito pelo painel ao confirmar pagamento (aguardando_financeiro
--                           -> pagamento_aprovado), aciona o webhook finalizar-atendimento do n8n.
--   aguardando_forms    -- escrito só pelo n8n, depois do webhook: manda o formulário ao
--                           cliente e espera ele preencher e confirmar. Quando confirmar, o
--                           próprio n8n grava status = 'resolvida' direto no banco — o painel
--                           não escreve 'resolvida' nesse fluxo.
--
-- `conversas.status` não tem enum, só uma CHECK constraint (conversas_status_chk) — não dá
-- pra "adicionar um valor" nela, então ela precisa ser recriada com os valores novos
-- incluídos. `sistema_colunas.chave` não tem CHECK constraint (confirmado antes de escrever
-- isto), então não precisa de alteração equivalente lá.

ALTER TABLE felipe_system.conversas DROP CONSTRAINT IF EXISTS conversas_status_chk;
ALTER TABLE felipe_system.conversas ADD CONSTRAINT conversas_status_chk CHECK (
  status = ANY (ARRAY[
    'ativa', 'aguardando_humano', 'em_atendimento', 'aguardando_cliente',
    'aguardando_financeiro', 'pagamento_aprovado', 'aguardando_forms', 'resolvida'
  ]::text[])
);

-- Seed das duas raias novas para os projetos que já existem, entre "Aguardando financeiro"
-- e "Resolvida". Ordem alta de propósito (ficam no fim); ajustar a posição pelo admin
-- (/admin/sistemas/:id/colunas) se quiser reordenar.
INSERT INTO felipe_system.sistema_colunas (sistema_id, chave, titulo, cor, ordem, visivel)
SELECT s.id, raia.chave, raia.titulo, raia.cor, raia.ordem, TRUE
FROM felipe_system.sistemas s
CROSS JOIN (VALUES
  ('pagamento_aprovado', 'Pagamento aprovado', '#0891b2', 100),
  ('aguardando_forms', 'Aguardando formulário', '#7c3aed', 101)
) AS raia(chave, titulo, cor, ordem)
ON CONFLICT (sistema_id, chave) DO NOTHING;
