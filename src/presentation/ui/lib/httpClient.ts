export class ErroHttp extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly codigo: string,
  ) {
    super(message);
    this.name = "ErroHttp";
  }
}

async function requisitar<T>(url: string, init?: RequestInit): Promise<T> {
  const resposta = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    credentials: "same-origin",
  });

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    throw new ErroHttp(corpo?.mensagem ?? "Erro inesperado", resposta.status, corpo?.erro ?? "ERRO_DESCONHECIDO");
  }

  return corpo as T;
}

export const httpClient = {
  get: <T>(url: string) => requisitar<T>(url, { method: "GET" }),
  post: <T>(url: string, body?: unknown) => requisitar<T>(url, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(url: string, body?: unknown) => requisitar<T>(url, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T>(url: string, body?: unknown) => requisitar<T>(url, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T>(url: string) => requisitar<T>(url, { method: "DELETE" }),
};
