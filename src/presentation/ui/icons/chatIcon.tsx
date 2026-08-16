import type { ReactElement } from "react";

const COR_FUNDO = "#4f46e5";
const COR_BOLHA = "#ffffff";

/**
 * Ícone de chat (bolha de conversa com "..." de digitação) usado nos ícones do PWA.
 * Gerado via JSX porque o ImageResponse (satori) exige `display` explícito em todo nó com
 * dimensões — sem isso o layout de flexbox não resolve.
 */
export function iconeDeChat(tamanho: number, opcoes?: { preenchimento?: number; cantoArredondado?: boolean }): ReactElement {
  const preenchimento = opcoes?.preenchimento ?? 0;
  const cantoArredondado = opcoes?.cantoArredondado ?? true;
  const area = tamanho - preenchimento * 2;
  const bolhaLargura = area * 0.62;
  const bolhaAltura = area * 0.48;
  const raioBolha = area * 0.16;
  const pontoTamanho = area * 0.075;
  const rabicho = bolhaAltura * 0.34;

  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COR_FUNDO,
        borderRadius: cantoArredondado ? area * 0.22 : 0,
      }}
    >
      <div
        style={{
          position: "relative",
          width: bolhaLargura,
          height: bolhaAltura,
          display: "flex",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: pontoTamanho,
            background: COR_BOLHA,
            borderRadius: raioBolha,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: pontoTamanho,
                height: pontoTamanho,
                borderRadius: pontoTamanho,
                background: COR_FUNDO,
                display: "flex",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: bolhaLargura * 0.16,
            bottom: -rabicho * 0.42,
            width: rabicho,
            height: rabicho,
            background: COR_BOLHA,
            transform: "rotate(45deg)",
            borderRadius: rabicho * 0.15,
            display: "flex",
          }}
        />
      </div>
    </div>
  );
}
