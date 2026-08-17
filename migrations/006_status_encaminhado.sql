-- Novo status do painel: encaminhado.
--
--   encaminhado -- escrito pelo painel (drag-and-drop ou menu "mover para"), só a partir de
--                   aguardando_forms. Passo manual do operador depois que o cliente confirma
--                   o formulário: encaminha a conversa pra outro setor/fila antes de marcar
--                   como resolvida (penúltimo status do fluxo, logo antes de resolvida).
--
-- `conversas.status` não tem enum, só uma CHECK constraint (conversas_status_chk) — não dá
-- pra "adicionar um valor" nela, então ela precisa ser recriada com o valor novo incluído
-- (mesma mecânica da migration 5). `sistema_colunas.chave` não tem CHECK constraint.

ALTER TABLE felipe_system.conversas DROP CONSTRAINT IF EXISTS conversas_status_chk;
ALTER TABLE felipe_system.conversas ADD CONSTRAINT conversas_status_chk CHECK (
  status = ANY (ARRAY[
    'ativa', 'aguardando_humano', 'em_atendimento', 'aguardando_cliente',
    'aguardando_financeiro', 'pagamento_aprovado', 'aguardando_forms', 'encaminhado', 'resolvida'
  ]::text[])
);

-- Seed da raia nova para os projetos que já existem. Ordem alta de propósito (fica no fim,
-- mesmo padrão da migration 5) — reordenar pelo admin (/admin/sistemas/:id/colunas) se quiser
-- posicioná-la entre "Aguardando formulário" e "Resolvida".
INSERT INTO felipe_system.sistema_colunas (sistema_id, chave, titulo, cor, ordem, visivel)
SELECT s.id, 'encaminhado', 'Encaminhado', '#f97316', 102, TRUE
FROM felipe_system.sistemas s
ON CONFLICT (sistema_id, chave) DO NOTHING;
