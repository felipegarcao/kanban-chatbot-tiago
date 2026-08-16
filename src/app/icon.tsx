import { ImageResponse } from "next/og";
import { iconeDeChat } from "@/presentation/ui/icons/chatIcon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(iconeDeChat(size.width), size);
}
