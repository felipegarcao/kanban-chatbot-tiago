const COMPACTO = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });
const INTEIRO = new Intl.NumberFormat("pt-BR");
const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const MOEDA_COMPACTA = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatarNumero(valor: number): string {
  return valor >= 100_000 ? COMPACTO.format(valor) : INTEIRO.format(valor);
}

export function formatarMoeda(valor: number): string {
  return valor >= 1_000_000 ? MOEDA_COMPACTA.format(valor) : MOEDA.format(valor);
}

export function formatarPercentual(parte: number, total: number): string {
  if (total <= 0) return "—";
  return `${Math.round((parte / total) * 100)}%`;
}

export function formatarDuracao(minutos: number | null): string {
  if (minutos === null) return "—";
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);
  return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`;
}

export function formatarDataCurta(dataISO: string): string {
  return new Date(`${dataISO}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
