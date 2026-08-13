"use client";

import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Field } from "./Field";

export interface ColunaTabela<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataListProps<T> {
  itens: T[];
  getId: (item: T) => string | number;
  colunas: ColunaTabela<T>[];
  renderCard: (item: T) => ReactNode;
  buscarPlaceholder: string;
  filtrar: (item: T, query: string) => boolean;
  novoHref: string;
  novoRotulo: string;
  tituloVazio: string;
  tamanhoPagina?: number;
}

export function DataList<T>({
  itens,
  getId,
  colunas,
  renderCard,
  buscarPlaceholder,
  filtrar,
  novoHref,
  novoRotulo,
  tituloVazio,
  tamanhoPagina = 10,
}: DataListProps<T>) {
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return q ? itens.filter((item) => filtrar(item, q)) : itens;
  }, [itens, busca, filtrar]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / tamanhoPagina));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const pagina0 = filtrados.slice((paginaAtual - 1) * tamanhoPagina, paginaAtual * tamanhoPagina);

  function handleBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="max-w-xs flex-1">
          <Field
            label="Buscar"
            type="search"
            icone={Search}
            placeholder={buscarPlaceholder}
            aria-label={buscarPlaceholder}
            value={busca}
            onChange={(e) => handleBusca(e.target.value)}
          />
        </div>
        <Link href={novoHref}>
          <Button type="button" icone={Plus}>
            {novoRotulo}
          </Button>
        </Link>
      </div>

      {filtrados.length === 0 && (
        <EmptyState titulo={tituloVazio} descricao={busca ? "Nenhum resultado para a busca." : undefined} />
      )}

      {filtrados.length > 0 && (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface">
                <tr>
                  {colunas.map((coluna) => (
                    <th key={coluna.header} className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted">
                      {coluna.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagina0.map((item) => (
                  <tr key={getId(item)} className="bg-background transition-colors hover:bg-surface">
                    {colunas.map((coluna) => (
                      <td key={coluna.header} className={`px-4 py-3 ${coluna.className ?? ""}`}>
                        {coluna.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">{pagina0.map((item) => renderCard(item))}</div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-between gap-3">
              <Button
                variante="secondary"
                icone={ChevronLeft}
                disabled={paginaAtual <= 1}
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <Button
                variante="secondary"
                disabled={paginaAtual >= totalPaginas}
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                className="flex-row-reverse"
                icone={ChevronRight}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
