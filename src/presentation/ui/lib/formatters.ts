export function formatarTelefone(telefone: string | null): string {
  if (!telefone) return "—";
  const digitos = telefone.replace("@s.whatsapp.net", "").replace(/\D/g, "");
  // Formato BR: 55 DD NNNNN-NNNN
  const match = digitos.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
  }
  return telefone.replace("@s.whatsapp.net", "");
}

const UNIDADES: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

export function tempoRelativo(dataIso: string | null): string {
  if (!dataIso) return "—";
  const segundos = (new Date(dataIso).getTime() - Date.now()) / 1000;

  if (Math.abs(segundos) < 60) return "agora mesmo";

  for (const [unidade, segundosPorUnidade] of UNIDADES) {
    if (Math.abs(segundos) >= segundosPorUnidade) {
      return rtf.format(Math.round(segundos / segundosPorUnidade), unidade);
    }
  }
  return rtf.format(Math.round(segundos / 60), "minute");
}
