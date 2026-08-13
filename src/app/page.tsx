"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUsuarioLogado } from "@/presentation/ui/features/auth/useUsuarioLogado";

export default function RootPage() {
  const router = useRouter();
  const { data: usuario, isLoading } = useUsuarioLogado();

  useEffect(() => {
    if (isLoading) return;
    router.replace(usuario ? "/app" : "/login");
  }, [isLoading, usuario, router]);

  return null;
}
