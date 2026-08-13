import type { Papel } from "@/core/domain/Usuario";

export interface SessaoPayload {
  usuarioId: number;
  papel: Papel;
}

/**
 * `sistemasPermitidos` fica de fora do JWT de propósito: é lido fresco do banco a cada
 * request (ver ObterUsuarioLogado), para que revogar acesso a um projeto surta efeito
 * imediato em vez de esperar o token de 2h expirar.
 */
export interface SessionService {
  criar(payload: SessaoPayload): Promise<string>;
  verificar(token: string): Promise<SessaoPayload | null>;
}
