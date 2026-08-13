import { NextResponse } from "next/server";

export interface IntervaloValidado {
  dataInicio?: Date;
  dataFim?: Date;
}

type Resultado = { intervalo: IntervaloValidado; erro?: undefined } | { intervalo?: undefined; erro: NextResponse };

const PADRAO_DATA = /^\d{4}-\d{2}-\d{2}$/;

function erroInvalido(mensagem: string): NextResponse {
  return NextResponse.json({ erro: "DADOS_INVALIDOS", mensagem }, { status: 400 });
}

/**
 * Lê `de`/`ate` (YYYY-MM-DD, formato nativo de `<input type="date">`) da query string e
 * valida antes de virar Date. `ate` vira fim do dia (23:59:59.999 UTC) — senão o dia
 * escolhido como fim ficaria de fora do intervalo, já que meia-noite exclui o resto do dia.
 * Retorna as duas datas juntas, as duas ausentes (caso de uso aplica o padrão de 30 dias),
 * ou uma resposta de erro pronta pra devolver — nunca deixa passar um intervalo pela metade.
 */
export function lerIntervaloDaQuery(url: URL): Resultado {
  const deStr = url.searchParams.get("de");
  const ateStr = url.searchParams.get("ate");

  if (!deStr && !ateStr) return { intervalo: {} };

  if (!deStr || !ateStr) {
    return { erro: erroInvalido("Informe as duas datas do intervalo (de e até), ou nenhuma.") };
  }

  if (!PADRAO_DATA.test(deStr) || !PADRAO_DATA.test(ateStr)) {
    return { erro: erroInvalido("Datas devem estar no formato AAAA-MM-DD.") };
  }

  const dataInicio = new Date(`${deStr}T00:00:00.000Z`);
  const dataFim = new Date(`${ateStr}T23:59:59.999Z`);

  if (Number.isNaN(dataInicio.getTime()) || Number.isNaN(dataFim.getTime())) {
    return { erro: erroInvalido("Data inválida.") };
  }

  if (dataInicio > dataFim) {
    return { erro: erroInvalido("A data inicial não pode ser depois da data final.") };
  }

  return { intervalo: { dataInicio, dataFim } };
}
