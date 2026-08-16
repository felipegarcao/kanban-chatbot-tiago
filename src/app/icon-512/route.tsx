import { ImageResponse } from "next/og";
import { iconeDeChat } from "@/presentation/ui/icons/chatIcon";

/** URL fixa (fora da convenção especial `icon`) para poder ser referenciada em `manifest.ts`. */
export async function GET() {
  return new ImageResponse(iconeDeChat(512), { width: 512, height: 512 });
}
