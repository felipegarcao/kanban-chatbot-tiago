"use client";

import { useRouter } from "next/navigation";
import { FormCard } from "@/presentation/ui/components/FormCard";
import { ProjetoForm } from "@/presentation/ui/features/sistemas/ProjetoForm";
import { useCriarProjeto } from "@/presentation/ui/features/sistemas/useCriarProjeto";

export default function NovoProjetoPage() {
  const router = useRouter();
  const criar = useCriarProjeto();

  return (
    <FormCard titulo="Novo projeto" descricao="Crie um novo projeto para organizar conversas." voltarHref="/admin" voltarRotulo="Projetos">
      <ProjetoForm
        salvando={criar.isPending}
        erro={criar.error}
        onSalvar={(dados) => criar.mutate(dados, { onSuccess: () => router.push("/admin") })}
      />
    </FormCard>
  );
}
