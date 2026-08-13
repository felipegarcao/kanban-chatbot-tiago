import type { Coluna, ColunaRepository, ConfiguracaoColuna } from "@/core/application/ports/ColunaRepository";
import type { Queryable } from "@/core/application/ports/Queryable";
import type { StatusConversa } from "@/core/domain/Conversa";

interface ColunaRow {
  id: number;
  sistema_id: number;
  chave: string;
  titulo: string;
  cor: string;
  ordem: number;
  visivel: boolean;
}

function paraDominio(row: ColunaRow): Coluna {
  return {
    id: row.id,
    sistemaId: row.sistema_id,
    chave: row.chave as StatusConversa,
    titulo: row.titulo,
    cor: row.cor,
    ordem: row.ordem,
    visivel: row.visivel,
  };
}

export class PgColunaRepository implements ColunaRepository {
  constructor(private readonly db: Queryable) {}

  async listarPorProjeto(sistemaId: number, apenasVisiveis: boolean): Promise<Coluna[]> {
    const filtroVisivel = apenasVisiveis ? "AND visivel = TRUE" : "";
    const { rows } = await this.db.query<ColunaRow>(
      `SELECT id, sistema_id, chave, titulo, cor, ordem, visivel FROM felipe_system.sistema_colunas
       WHERE sistema_id = $1 ${filtroVisivel} ORDER BY ordem ASC`,
      [sistemaId],
    );
    return rows.map(paraDominio);
  }

  async configurar(sistemaId: number, colunas: readonly ConfiguracaoColuna[]): Promise<void> {
    for (const coluna of colunas) {
      await this.db.query(
        `UPDATE felipe_system.sistema_colunas
         SET titulo = $3, cor = $4, ordem = $5, visivel = $6
         WHERE sistema_id = $1 AND chave = $2`,
        [sistemaId, coluna.chave, coluna.titulo, coluna.cor, coluna.ordem, coluna.visivel],
      );
    }
  }

  async inserirPadrao(sistemaId: number, colunas: readonly ConfiguracaoColuna[]): Promise<void> {
    for (const coluna of colunas) {
      await this.db.query(
        `INSERT INTO felipe_system.sistema_colunas (sistema_id, chave, titulo, cor, ordem, visivel)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (sistema_id, chave) DO NOTHING`,
        [sistemaId, coluna.chave, coluna.titulo, coluna.cor, coluna.ordem, coluna.visivel],
      );
    }
  }
}
