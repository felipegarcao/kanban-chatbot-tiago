import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/presentation/ui/components/Badge";
import { formatarTelefone, tempoRelativo } from "@/presentation/ui/lib/formatters";
import { MoverParaMenu } from "./MoverParaMenu";
import type { ConversaResumo } from "./types";
import type { StatusConversa } from "@/core/domain/Conversa";

const ROTULO_ESTADO: Record<string, string> = {
  abertura: "Abertura",
  coletando: "Coletando dados",
  pronto_oferta: "Pronto p/ oferta",
  ofertado: "Ofertado",
  link_enviado: "Link enviado",
  aguardando_forms: "Aguardando formulário",
  finalizado: "Finalizado",
};

interface ConversaCardProps {
  conversa: ConversaResumo;
  onClick?: () => void;
  onMover: (novoStatus: StatusConversa) => void;
  movendo?: boolean;
}

export function ConversaCard({ conversa, onClick, onMover, movendo }: ConversaCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `conversa-${conversa.id}`,
    data: { conversa },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`flex flex-col gap-1.5 rounded-lg border border-border bg-surface p-3 shadow-sm
        transition-colors hover:border-accent/50 ${isDragging ? "opacity-40" : ""} ${movendo ? "animate-pulse" : ""}`}
    >
      <button
        type="button"
        onClick={onClick}
        {...attributes}
        {...listeners}
        className="flex flex-col gap-1.5 text-left focus-visible:outline-2 focus-visible:outline-ring"
        aria-roledescription="conversa arrastável"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">{conversa.contatoNome ?? "Sem nome"}</span>
          {conversa.prioridade === "critica" && <Badge tom="critico">Crítica</Badge>}
        </div>

        <span className="text-xs text-muted">{formatarTelefone(conversa.contatoTelefone)}</span>

        {conversa.ultimaMensagemTrecho && (
          <p className="line-clamp-2 text-sm text-foreground/80">{conversa.ultimaMensagemTrecho}</p>
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="text-xs text-muted">{tempoRelativo(conversa.ultimaMensagemEm)}</span>
          {conversa.estado && <Badge tom="neutro">{ROTULO_ESTADO[conversa.estado] ?? conversa.estado}</Badge>}
        </div>
      </button>

      <MoverParaMenu statusAtual={conversa.status} onMover={onMover} disabled={movendo} />
    </div>
  );
}
