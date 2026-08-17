"use client";

import { AlertTriangle, ArrowRight, Clock, CreditCard, Eye, Phone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/presentation/ui/components/Badge";
import { BottomSheet } from "@/presentation/ui/components/BottomSheet";
import { formatarTelefone, tempoRelativo } from "@/presentation/ui/lib/formatters";
import type { StatusConversa } from "@/core/domain/Conversa";
import { ConfirmarPagamentoModal } from "./ConfirmarPagamentoModal";
import { alvosPermitidos } from "./transicoesPermitidas";
import type { ConversaResumo } from "./types";

const ROTULO_STATUS: Record<StatusConversa, string> = {
  ativa: "Ativa (bot)",
  aguardando_humano: "Aguardando humano",
  aguardando_financeiro: "Aguardando financeiro",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  pagamento_aprovado: "Pagamento aprovado",
  aguardando_forms: "Aguardando formulário",
  encaminhado: "Encaminhado",
  resolvida: "Resolvida",
};

interface MobileConversaCardProps {
  conversa: ConversaResumo;
  onVerDetalhe: () => void;
  onMover: (novoStatus: StatusConversa) => void;
}

export function MobileConversaCard({ conversa, onVerDetalhe, onMover }: MobileConversaCardProps) {
  const [sheetAberto, setSheetAberto] = useState(false);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const alvos = alvosPermitidos(conversa.status);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetAberto(true)}
        className="flex min-h-[44px] w-full flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 text-left shadow-sm"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{conversa.contatoNome ?? "Sem nome"}</span>
          {conversa.prioridade === "critica" && (
            <Badge tom="critico">
              <AlertTriangle size={11} aria-hidden="true" /> Crítica
            </Badge>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Phone size={12} aria-hidden="true" /> {formatarTelefone(conversa.contatoTelefone)}
        </span>
        {conversa.ultimaMensagemTrecho && (
          <p className="line-clamp-2 text-sm text-foreground/80">{conversa.ultimaMensagemTrecho}</p>
        )}
        <span className="flex items-center gap-1 text-xs text-muted">
          <Clock size={12} aria-hidden="true" /> {tempoRelativo(conversa.ultimaMensagemEm)}
        </span>
      </button>

      {sheetAberto && (
        <BottomSheet titulo={conversa.contatoNome ?? "Conversa"} onFechar={() => setSheetAberto(false)}>
          <SheetBotao
            icone={Eye}
            onClick={() => {
              setSheetAberto(false);
              onVerDetalhe();
            }}
          >
            Ver conversa
          </SheetBotao>

          {conversa.status === "aguardando_financeiro" && (
            <SheetBotao
              icone={CreditCard}
              onClick={() => {
                setSheetAberto(false);
                setModalPagamentoAberto(true);
              }}
            >
              Confirmar pagamento
            </SheetBotao>
          )}

          {alvos.map((status) => (
            <SheetBotao
              key={status}
              icone={ArrowRight}
              onClick={() => {
                setSheetAberto(false);
                onMover(status);
              }}
            >
              Mover para {ROTULO_STATUS[status]}
            </SheetBotao>
          ))}
        </BottomSheet>
      )}

      {modalPagamentoAberto && (
        <ConfirmarPagamentoModal
          conversaId={conversa.id}
          contatoNome={conversa.contatoNome}
          onFechar={() => setModalPagamentoAberto(false)}
          onConfirmado={() => setModalPagamentoAberto(false)}
        />
      )}
    </>
  );
}

function SheetBotao({
  children,
  onClick,
  icone: Icone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icone: typeof Eye;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-border/40 focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Icone size={16} className="text-muted" aria-hidden="true" />
      {children}
    </button>
  );
}
