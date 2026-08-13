"use client";

import { useState } from "react";
import { Button } from "@/presentation/ui/components/Button";
import { Field } from "@/presentation/ui/components/Field";
import { Modal } from "@/presentation/ui/components/Modal";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";
import { useConfirmarPagamento } from "./useConfirmarPagamento";

interface ConfirmarPagamentoModalProps {
  conversaId: number;
  contatoNome: string | null;
  onFechar: () => void;
  onConfirmado: () => void;
}

export function ConfirmarPagamentoModal({
  conversaId,
  contatoNome,
  onFechar,
  onConfirmado,
}: ConfirmarPagamentoModalProps) {
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const confirmar = useConfirmarPagamento();

  function handleConfirmar() {
    confirmar.mutate(
      {
        conversaId,
        valor: valor.trim() ? Number(valor.replace(",", ".")) : undefined,
        observacao: observacao.trim() || undefined,
      },
      { onSuccess: onConfirmado },
    );
  }

  const mensagemErro =
    confirmar.error instanceof ErroHttp
      ? confirmar.error.message
      : confirmar.isError
        ? "Não foi possível confirmar o pagamento. Tente novamente."
        : null;

  return (
    <Modal titulo="Confirmar pagamento" onFechar={onFechar} fecharBloqueado={confirmar.isPending}>
      <p className="text-sm text-foreground">
        Confirmar que o pagamento de <strong>{contatoNome ?? "este contato"}</strong> caiu? Essa ação move a
        conversa para <strong>Resolvida</strong> e não pode ser desfeita por aqui.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Field
          label="Valor recebido (opcional)"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          disabled={confirmar.isPending}
        />
        <Field
          label="Observação (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          disabled={confirmar.isPending}
        />
      </div>

      {mensagemErro && (
        <p role="alert" className="mt-3 text-sm text-critical">
          {mensagemErro}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variante="secondary" onClick={onFechar} disabled={confirmar.isPending}>
          Cancelar
        </Button>
        <Button onClick={handleConfirmar} carregando={confirmar.isPending}>
          Confirmar pagamento
        </Button>
      </div>
    </Modal>
  );
}
