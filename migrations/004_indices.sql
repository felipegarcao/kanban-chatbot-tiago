CREATE INDEX IF NOT EXISTS conversas_sistema_status_ultima_msg_idx
  ON felipe_system.conversas (sistema_id, status, ultima_mensagem_em DESC);

CREATE INDEX IF NOT EXISTS mensagens_conversa_criada_em_idx
  ON felipe_system.mensagens (conversa_id, criada_em);
