import type {
  PayloadFinalizarAtendimento,
  WebhookFinalizarAtendimento,
} from "@/core/application/ports/WebhookFinalizarAtendimento";

const TIMEOUT_MS = 10_000;

export class N8nWebhookFinalizarAtendimento implements WebhookFinalizarAtendimento {
  constructor(private readonly url: string) {}

  async notificar(payload: PayloadFinalizarAtendimento): Promise<void> {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), TIMEOUT_MS);

    try {
      const resposta = await fetch(this.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controlador.signal,
      });

      if (!resposta.ok) {
        throw new Error(`Webhook finalizar-atendimento respondeu ${resposta.status}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
