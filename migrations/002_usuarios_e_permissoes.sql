CREATE TABLE IF NOT EXISTS felipe_system.usuarios (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  papel TEXT NOT NULL DEFAULT 'operador',
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT usuarios_papel_check CHECK (papel IN ('admin', 'operador'))
);

CREATE TABLE IF NOT EXISTS felipe_system.usuario_sistemas (
  usuario_id INTEGER NOT NULL REFERENCES felipe_system.usuarios(id) ON DELETE CASCADE,
  sistema_id INTEGER NOT NULL REFERENCES felipe_system.sistemas(id) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, sistema_id)
);
