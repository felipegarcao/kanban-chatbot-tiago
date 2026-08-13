"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Rows3, Trash2 } from "lucide-react";
import { Button } from "@/presentation/ui/components/Button";
import { ConfirmDialog } from "@/presentation/ui/components/ConfirmDialog";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { FormCard } from "@/presentation/ui/components/FormCard";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { ProjetoForm } from "@/presentation/ui/features/sistemas/ProjetoForm";
import { useProjetos } from "@/presentation/ui/features/sistemas/useProjetos";
import { useEditarProjeto } from "@/presentation/ui/features/sistemas/useEditarProjeto";
import { useDeletarProjeto } from "@/presentation/ui/features/sistemas/useDeletarProjeto";

export default function EditarProjetoPage({ params }: { params: Promise<{ sistemaId: string }> }) {
  const { sistemaId: sistemaIdParam } = use(params);
  const sistemaId = Number(sistemaIdParam);
  const router = useRouter();
  const projetos = useProjetos();
  const editar = useEditarProjeto();
  const deletar = useDeletarProjeto();
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);

  const projeto = projetos.data?.find((p) => p.id === sistemaId);

  if (projetos.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (projetos.isError) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState mensagem="Não foi possível carregar o projeto." aoTentarNovamente={() => projetos.refetch()} />
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState mensagem="Projeto não encontrado." />
      </div>
    );
  }

  return (
    <>
      <FormCard
        titulo="Editar projeto"
        voltarHref="/admin"
        voltarRotulo="Projetos"
        rodape={
          <div className="flex flex-col gap-3">
            <Link
              href={`/admin/sistemas/${sistemaId}/colunas`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-4 text-sm text-foreground hover:border-accent/50"
            >
              <span className="flex items-center gap-2">
                <Rows3 size={16} className="text-muted" aria-hidden="true" />
                Configurar raias do quadro
              </span>
              <span className="text-muted">→</span>
            </Link>

            <div className="rounded-xl border border-critical/30 p-4">
              <p className="text-sm font-medium text-foreground">Zona de risco</p>
              <p className="mt-0.5 text-xs text-muted">
                Excluir remove o projeto permanentemente. Só é possível se ele não tiver conversas.
              </p>
              <Button
                type="button"
                variante="danger"
                icone={Trash2}
                className="mt-3"
                onClick={() => setConfirmandoExclusao(true)}
              >
                Excluir projeto
              </Button>
            </div>
          </div>
        }
      >
        <ProjetoForm
          projeto={projeto}
          salvando={editar.isPending}
          erro={editar.error}
          onSalvar={(dados) => editar.mutate({ sistemaId, ...dados })}
        />
      </FormCard>

      {confirmandoExclusao && (
        <ConfirmDialog
          titulo="Excluir projeto"
          mensagem={`Tem certeza que quer excluir "${projeto.nome}"? Isso não pode ser desfeito.`}
          rotuloConfirmar="Excluir"
          confirmando={deletar.isPending}
          erro={deletar.error}
          onFechar={() => setConfirmandoExclusao(false)}
          onConfirmar={() => deletar.mutate(sistemaId, { onSuccess: () => router.push("/admin") })}
        />
      )}
    </>
  );
}
