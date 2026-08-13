-- `chave` é exatamente o valor de conversas.status daquela raia — contrato com o banco,
-- não texto livre. Só titulo/cor/ordem/visivel são configuráveis pelo admin.
CREATE TABLE IF NOT EXISTS felipe_system.sistema_colunas (
  id SERIAL PRIMARY KEY,
  sistema_id INTEGER NOT NULL REFERENCES felipe_system.sistemas(id) ON DELETE CASCADE,
  chave TEXT NOT NULL,
  titulo TEXT NOT NULL,
  cor TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  visivel BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT sistema_colunas_chave_check CHECK (
    chave IN ('ativa', 'aguardando_humano', 'aguardando_financeiro', 'em_atendimento', 'aguardando_cliente', 'resolvida')
  ),
  CONSTRAINT sistema_colunas_unica UNIQUE (sistema_id, chave)
);

-- Seed das 6 raias padrão para cada sistema já existente.
INSERT INTO felipe_system.sistema_colunas (sistema_id, chave, titulo, cor, ordem, visivel)
SELECT s.id, raia.chave, raia.titulo, raia.cor, raia.ordem, TRUE
FROM felipe_system.sistemas s
CROSS JOIN (VALUES
  ('ativa', 'Ativa', '#6366f1', 0),
  ('aguardando_humano', 'Aguardando humano', '#f59e0b', 1),
  ('em_atendimento', 'Em atendimento', '#0ea5e9', 2),
  ('aguardando_cliente', 'Aguardando cliente', '#a855f7', 3),
  ('aguardando_financeiro', 'Aguardando financeiro', '#22c55e', 4),
  ('resolvida', 'Resolvida', '#64748b', 5)
) AS raia(chave, titulo, cor, ordem)
ON CONFLICT (sistema_id, chave) DO NOTHING;
