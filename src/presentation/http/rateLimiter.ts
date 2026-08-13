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
