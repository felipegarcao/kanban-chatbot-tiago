-- Coluna de marco temporal: quando a conversa foi resolvida.
--
--   finalizada_em -- escrita pelo painel (PgConversaRepository.salvar) toda vez que a
--                    conversa transiciona pra `resolvida` (Conversa.resolver), com o
--                    timestamp do clock da aplicação (mesmo padrão de `assumida_em`).
--
-- IF NOT EXISTS porque a coluna já existe na base de produção (criada fora do fluxo de
-- migrations, mesma situação da tabela `conversas` em si) — este arquivo só formaliza o
-- schema pra qualquer ambiente que ainda não tenha a coluna.
ALTER TABLE felipe_system.conversas ADD COLUMN IF NOT EXISTS finalizada_em TIMESTAMPTZ NULL;
