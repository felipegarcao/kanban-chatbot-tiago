"use client";

import { AlertTriangle, Bot, CheckCircle2, Clock3, CreditCard, Phone, Undo2, UserCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Skeleton } from "@/presentation/ui/components/Skeleton";
import { ErrorState } from "@/presentation/ui/components/ErrorState";
import { formatarTelefone, tempoRelativo } from "@/presentation/ui/lib/formatters";
import { silenciaBot } from "@/core/domain/regrasDoWorkflow";
import type { StatusConversa } from "@/core/domain/Conversa";
import { ConfirmarPagamentoModal } from "./ConfirmarPagamentoModal";
import { useDetalheConversa } from "./useDetalheConversa";
import { useAssumirConversa, useDevolverParaBot, useMoverParaGenerico } from "./useAcoesDaConversa";
import type { MensagemResumo } from "./types";

const ROTULO_STATUS: Record<StatusConversa, string> = {
  ativa: "Ativa (bot)",
  aguardando_humano: "Aguardando humano",
  aguardando_financeiro: "Aguardando financeiro",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  pagamento_aprovado: "Pagamento aprovado",
  aguardando_forms: "Aguardando formulário",
  resolvida: "Resolvida",
};

export function ConversaDrawer({ conversaId, onFechar }: { conversaId: number; onFechar: () => void }) {
  const { data, isPending, isError, refetch } = useDetalheConversa(conversaId);
  const assumir = useAssumirConversa();
  const devolverParaBot = useDevolverParaBot();
  const mover = useMoverParaGenerico();
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);

  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onFechar]);

  const acaoEmAndamento = assumir.isPending || devolverParaBot.isPending || mover.isPending;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalhe da conversa"
        className="flex h-full w-full max-w-md flex-col bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isPending && (
          <div className="flex flex-col gap-3 p-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {isError && (
          <div className="p-4">
            <ErrorState mensagem="Não foi possível carregar a conversa." aoTentarNovamente={() => refetch()} />
          </div>
        )}

        {data && (
          <>
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {data.conversa.contatoNome ?? "Sem nome"}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-muted">
                  <Phone size={13} aria-hidden="true" /> {formatarTelefone(data.conversa.contatoTelefone)}
                </p>
              </div>
              <button
                type="button"
                onClick={onFechar}
                aria-label="Fechar detalhe da conversa"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-border/40 hover:text-foreground"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-border px-4 py-2">
              <span className="text-xs font-medium text-muted">{ROTULO_STATUS[data.conversa.status]}</span>
              {data.conversa.estado && <span className="text-xs text-muted">· {data.conversa.estado}</span>}
            </div>

            {silenciaBot(data.conversa.status) && (
              <p role="note" className="flex items-center gap-1.5 border-b border-border bg-warning/10 px-4 py-2 text-xs text-warning">
                <AlertTriangle size={13} aria-hidden="true" /> O bot está pausado nesta conversa enquanto ela estiver
                neste status.
              </p>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              <ThreadDeMensagens mensagens={data.mensagens} />
            </div>

            <div className="flex flex-col gap-2 border-t border-border p-4">
              {data.conversa.status === "aguardando_humano" && (
                <Button icone={UserCheck} carregando={assumir.isPending} onClick={() => assumir.mutate(conversaId)}>
                  Assumir conversa
                </Button>
              )}

              {data.conversa.status === "em_atendimento" && (
                <>
                  <Button
                    variante="secondary"
                    icone={Clock3}
                    carregando={mover.isPending}
                    disabled={acaoEmAndamento}
                    onClick={() => mover.mutate({ conversaId, novoStatus: "aguardando_cliente" })}
                  >
                    Aguardar cliente
                  </Button>
                  <Button
                    variante="secondary"
                    icone={CheckCircle2}
                    carregando={mover.isPending}
                    disabled={acaoEmAndamento}
                    onClick={() => mover.mutate({ conversaId, novoStatus: "resolvida" })}
                  >
                    Marcar como resolvida
                  </Button>
                  <div className="rounded-lg border border-warning/30 bg-warning/5 p-2">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs text-warning">
                      <AlertTriangle size={13} aria-hidden="true" /> Devolver para o bot reativa as respostas
                      automáticas no WhatsApp agora.
                    </p>
                    <Button
                      variante="danger"
                      icone={Bot}
                      carregando={devolverParaBot.isPending}
                      disabled={acaoEmAndamento}
                      onClick={() => devolverParaBot.mutate(conversaId)}
                    >
                      Devolver para o bot
                    </Button>
                  </div>
                </>
              )}

              {data.conversa.status === "aguardando_cliente" && (
                <>
                  <Button
                    variante="secondary"
                    icone={Undo2}
                    carregando={mover.isPending}
                    disabled={acaoEmAndamento}
                    onClick={() => mover.mutate({ conversaId, novoStatus: "em_atendimento" })}
                  >
                    Retomar atendimento
                  </Button>
                  <Button
                    variante="secondary"
                    icone={CheckCircle2}
                    carregando={mover.isPending}
                    disabled={acaoEmAndamento}
                    onClick={() => mover.mutate({ conversaId, novoStatus: "resolvida" })}
                  >
                    Marcar como resolvida
                  </Button>
                </>
              )}

              {data.conversa.status === "aguardando_financeiro" && (
                <Button icone={CreditCard} onClick={() => setModalPagamentoAberto(true)}>
                  Confirmar pagamento
                </Button>
              )}

              {data.conversa.status === "pagamento_aprovado" && (
                <p className="text-sm text-muted">
                  Pagamento aprovado. O n8n já foi acionado e vai enviar o formulário ao cliente — nenhuma ação do
                  operador aqui.
                </p>
              )}

              {data.conversa.status === "aguardando_forms" && (
                <p className="text-sm text-muted">
                  Aguardando o cliente preencher e confirmar o formulário. O n8n finaliza a conversa automaticamente
                  quando isso acontecer.
                </p>
              )}

              {(data.conversa.status === "ativa" || data.conversa.status === "resolvida") && (
                <p className="text-sm text-muted">Nenhuma ação disponível neste status.</p>
              )}
            </div>
          </>
        )}
      </div>

      {modalPagamentoAberto && data && (
        <ConfirmarPagamentoModal
          conversaId={conversaId}
          contatoNome={data.conversa.contatoNome}
          onFechar={() => setModalPagamentoAberto(false)}
          onConfirmado={() => setModalPagamentoAberto(false)}
        />
      )}
    </div>
  );
}

function ThreadDeMensagens({ mensagens }: { mensagens: MensagemResumo[] }) {
  if (mensagens.length === 0) {
    return <p className="text-sm text-muted">Nenhuma mensagem ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {mensagens.map((mensagem) => {
        const doContato = mensagem.autor === "contato";
        return (
          <li key={mensagem.id} className={`flex ${doContato ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                doContato ? "bg-border/50 text-foreground" : "bg-accent/15 text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{mensagem.conteudo}</p>
              <p className="mt-1 text-right text-[10px] text-muted">{tempoRelativo(mensagem.criadoEm)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
