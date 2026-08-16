import { ImageResponse } from "next/og";
import { iconeDeChat } from "@/presentation/ui/icons/chatIcon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(iconeDeChat(size.width), size);
}
