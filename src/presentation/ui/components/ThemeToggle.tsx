"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { aplicarTema, inscreverMudancaDeTema, lerTemaSalvo, salvarTema, type Tema } from "@/presentation/ui/lib/theme";

const OPCOES: { tema: Tema; rotulo: string; Icone: typeof Sun }[] = [
  { tema: "light", rotulo: "Claro", Icone: Sun },
  { tema: "system", rotulo: "Sistema", Icone: Monitor },
  { tema: "dark", rotulo: "Escuro", Icone: Moon },
];

function getServerSnapshot(): Tema {
  return "system";
}

export function ThemeToggle() {
  const tema = useSyncExternalStore(inscreverMudancaDeTema, lerTemaSalvo, getServerSnapshot);

  // Sincroniza a classe .dark no <html> com a preferência atual — não é setState, é efeito colateral em sistema externo (DOM).
  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  return (
    <div role="radiogroup" aria-label="Tema" className="flex gap-0.5 rounded-md border border-border bg-background p-0.5">
      {OPCOES.map(({ tema: valor, rotulo, Icone }) => (
        <button
          key={valor}
          type="button"
          role="radio"
          aria-checked={tema === valor}
          aria-label={rotulo}
          title={rotulo}
          onClick={() => salvarTema(valor)}
          className={`flex min-h-[32px] flex-1 items-center justify-center rounded px-2 py-1 transition-colors ${
            tema === valor ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
          }`}
        >
          <Icone size={14} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
