import { ImageResponse } from "next/og";
import { iconeDeChat } from "@/presentation/ui/icons/chatIcon";

/**
 * Variante "maskable": fundo sem cantos arredondados (o SO aplica a própria máscara — círculo,
 * squircle etc.) e com respiro extra em volta do glifo para não ser cortado pela máscara.
 */
export async function GET() {
  return new ImageResponse(iconeDeChat(512, { preenchimento: 512 * 0.14, cantoArredondado: false }), {
    width: 512,
    height: 512,
  });
}
