import type { NextRequest } from "next/server";

/**
 * Rate limit em memória para o login (5 tentativas / 15 min por email+IP). Suficiente para
 * uma instância única do painel; não sobrevive a restart nem escala pra múltiplas instâncias
 * — se isso vier a importar, trocar por um store compartilhado (Redis).
 */
const JANELA_MS = 15 * 60 * 1000;
const LIMITE_TENTATIVAS = 5;

interface Registro {
  tentativas: number;
  desde: number;
}

const tentativasPorChave = new Map<string, Registro>();

export function excedeuLimiteDeTentativas(chave: string): boolean {
  const registro = tentativasPorChave.get(chave);
  if (!registro) return false;
  if (Date.now() - registro.desde > JANELA_MS) {
    tentativasPorChave.delete(chave);
    return false;
  }
  return registro.tentativas >= LIMITE_TENTATIVAS;
}

export function registrarTentativaFalha(chave: string): void {
  const registro = tentativasPorChave.get(chave);
  if (!registro || Date.now() - registro.desde > JANELA_MS) {
    tentativasPorChave.set(chave, { tentativas: 1, desde: Date.now() });
    return;
  }
  registro.tentativas += 1;
}

export function limparTentativas(chave: string): void {
  tentativasPorChave.delete(chave);
}

/**
 * Limite separado para autocadastro público: como o link fica aberto pra qualquer um, conta
 * toda tentativa (sucesso incluso, não só falha) — o objetivo é limitar quantas contas um
 * mesmo IP consegue criar, não só travar tentativas malsucedidas.
 */
const JANELA_REGISTRO_MS = 60 * 60 * 1000;
const LIMITE_REGISTROS = 5;
const registrosPorChave = new Map<string, Registro>();

export function excedeuLimiteDeRegistro(chave: string): boolean {
  const registro = registrosPorChave.get(chave);
  if (!registro) return false;
  if (Date.now() - registro.desde > JANELA_REGISTRO_MS) {
    registrosPorChave.delete(chave);
    return false;
  }
  return registro.tentativas >= LIMITE_REGISTROS;
}

export function registrarTentativaDeRegistro(chave: string): void {
  const registro = registrosPorChave.get(chave);
  if (!registro || Date.now() - registro.desde > JANELA_REGISTRO_MS) {
    registrosPorChave.set(chave, { tentativas: 1, desde: Date.now() });
    return;
  }
  registro.tentativas += 1;
}

/**
 * Limite separado para o "esqueci minha senha": como não há confirmação por email, o email
 * sozinho já troca a senha — por isso o limite é apertado e conta toda tentativa (sucesso
 * incluso), tanto por IP quanto por email, pra dificultar tentativa de força bruta de emails.
 */
const JANELA_REDEFINICAO_MS = 15 * 60 * 1000;
const LIMITE_REDEFINICOES = 5;
const redefinicoesPorChave = new Map<string, Registro>();

export function excedeuLimiteDeRedefinicao(chave: string): boolean {
  const registro = redefinicoesPorChave.get(chave);
  if (!registro) return false;
  if (Date.now() - registro.desde > JANELA_REDEFINICAO_MS) {
    redefinicoesPorChave.delete(chave);
    return false;
  }
  return registro.tentativas >= LIMITE_REDEFINICOES;
}

export function registrarTentativaDeRedefinicao(chave: string): void {
  const registro = redefinicoesPorChave.get(chave);
  if (!registro || Date.now() - registro.desde > JANELA_REDEFINICAO_MS) {
    redefinicoesPorChave.set(chave, { tentativas: 1, desde: Date.now() });
    return;
  }
  registro.tentativas += 1;
}

export function obterIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}
