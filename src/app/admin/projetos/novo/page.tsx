"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjetoForm } from "@/presentation/ui/features/sistemas/ProjetoForm";
import { useCriarProjeto } from "@/presentation/ui/features/sistemas/useCriarProjeto";

export default function NovoProjetoPage() {
  const router = useRouter();
  const criar = useCriarProjeto();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link href="/admin" className="text-sm text-muted hover:text-foreground">
        ← Projetos
      </Link>
      <h1 className="text-lg font-semibold text-foreground">Novo projeto</h1>
      <ProjetoForm
        salvando={criar.isPending}
        erro={criar.error}
        onSalvar={(dados) => criar.mutate(dados, { onSuccess: () => router.push("/admin") })}
      />
    </div>
  );
}
