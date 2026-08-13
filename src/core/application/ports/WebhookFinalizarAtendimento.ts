export interface PayloadFinalizarAtendimento {
  conversaId: number;
  sistemaId: number;
  contatoNome: string | null;
  contatoTelefone: string | null;
  usuarioId: number;
  valor?: number;
  observacao?: string;
  confirmadoEm: string;
}

/**
 * Aciona o workflow do n8n que manda o formulário ao cliente e, quando ele confirmar,
 * finaliza a conversa (grava status = 'resolvida' direto no Postgres). O painel só dispara;
 * não espera nem controla o que acontece depois disso.
 */
export interface WebhookFinalizarAtendimento {
  notificar(payload: PayloadFinalizarAtendimento): Promise<void>;
}
