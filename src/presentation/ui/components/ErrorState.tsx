import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-critical/30 bg-critical/5 px-4 py-8 text-center"
    >
      <AlertTriangle size={20} className="text-critical" aria-hidden="true" />
      <p className="text-sm font-medium text-critical">{mensagem}</p>
      {aoTentarNovamente && (
        <Button variante="secondary" icone={RotateCw} onClick={aoTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
