import type { StatusConversa } from "@/core/domain/Conversa";
import { alvosPermitidos } from "./transicoesPermitidas";

const ROTULO_STATUS: Record<StatusConversa, string> = {
  ativa: "Ativa (bot)",
  aguardando_humano: "Aguardando humano",
  aguardando_financeiro: "Aguardando financeiro",
  em_atendimento: "Em atendimento",
  aguardando_cliente: "Aguardando cliente",
  resolvida: "Resolvida",
};

interface MoverParaMenuProps {
  statusAtual: StatusConversa;
  onMover: (novoStatus: StatusConversa) => void;
  disabled?: boolean;
}

/** Alternativa por teclado/menu ao drag-and-drop — sempre disponível, sem exigir arrastar. */
export function MoverParaMenu({ statusAtual, onMover, disabled }: MoverParaMenuProps) {
  const alvos = alvosPermitidos(statusAtual);
  if (alvos.length === 0) return null;

  return (
    <select
      aria-label="Mover conversa para outra coluna"
      className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground
        focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50"
      disabled={disabled}
      value=""
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onChange={(e) => {
        const valor = e.target.value as StatusConversa;
        if (valor) onMover(valor);
        e.target.value = "";
      }}
    >
      <option value="" disabled>
        Mover para…
      </option>
      {alvos.map((status) => (
        <option key={status} value={status}>
          {ROTULO_STATUS[status]}
        </option>
      ))}
    </select>
  );
}
