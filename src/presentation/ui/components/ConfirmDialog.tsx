"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";
import { ErroHttp } from "@/presentation/ui/lib/httpClient";

interface ConfirmDialogProps {
  titulo: string;
  mensagem: string;
  rotuloConfirmar?: string;
  perigo?: boolean;
  onConfirmar: () => void;
  onFechar: () => void;
  confirmando: boolean;
  erro?: unknown;
}

export function ConfirmDialog({
  titulo,
  mensagem,
  rotuloConfirmar = "Confirmar",
  perigo = true,
  onConfirmar,
  onFechar,
  confirmando,
  erro,
}: ConfirmDialogProps) {
  const mensagemErro =
    erro instanceof ErroHttp ? erro.message : erro ? "Não foi possível concluir a ação." : null;

  return (
    <Modal titulo={titulo} onFechar={onFechar} fecharBloqueado={confirmando}>
      <p className="text-sm text-foreground">{mensagem}</p>

      {mensagemErro && (
        <p role="alert" className="mt-3 text-sm text-critical">
          {mensagemErro}
        </p>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Button variante="secondary" onClick={onFechar} disabled={confirmando}>
          Cancelar
        </Button>
        <Button variante={perigo ? "danger" : "primary"} onClick={onConfirmar} carregando={confirmando}>
          {rotuloConfirmar}
        </Button>
      </div>
    </Modal>
  );
}
