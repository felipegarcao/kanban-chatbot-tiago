export interface IntervaloDeDatas {
  de: string;
  ate: string;
}

function paraDataISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

/** Últimos 30 dias até hoje — mesmo padrão do backend, pra abrir a tela já sincronizada com ele. */
export function intervaloPadrao(): IntervaloDeDatas {
  const ate = new Date();
  const de = new Date(ate);
  de.setDate(de.getDate() - 30);
  return { de: paraDataISO(de), ate: paraDataISO(ate) };
}

/** null quando válido; senão a mensagem pra mostrar embaixo dos campos. */
export function validarIntervalo(de: string, ate: string): string | null {
  if (!de || !ate) return "Informe as duas datas do intervalo.";
  const dataInicio = new Date(`${de}T00:00:00`);
  const dataFim = new Date(`${ate}T00:00:00`);
  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) return "Data inválida.";
  if (dataInicio > dataFim) return "A data inicial não pode ser depois da data final.";
  return null;
}
