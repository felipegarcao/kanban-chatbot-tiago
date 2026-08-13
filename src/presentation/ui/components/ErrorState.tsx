import { Button } from "./Button";

export function ErrorState({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-2 rounded-lg border border-critical/30 bg-critical/5 px-4 py-8 text-center">
      <p className="text-sm font-medium text-critical">{mensagem}</p>
      {aoTentarNovamente && (
        <Button variante="secondary" onClick={aoTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
