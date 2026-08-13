import type {
  DesempenhoOperador,
  DistribuicaoPorPrioridade,
  DistribuicaoPorStatus,
  Indicadores,
  IndicadoresRepository,
  VolumeDoDia,
} from "@/core/application/ports/IndicadoresRepository";
import type { Queryable } from "@/core/application/ports/Queryable";
import type { PrioridadeConversa, StatusConversa } from "@/core/domain/Conversa";

export class PgIndicadoresRepository implements IndicadoresRepository {
  constructor(private readonly db: Queryable) {}

  async obter(sistemaId: number, dataInicio: Date, dataFim: Date): Promise<Indicadores> {
    const params = [sistemaId, dataInicio, dataFim];

    const [contagens, porStatus, porPrioridade, porDia, valorConfirmado, tempoMedio, porOperador] =
      await Promise.all([
        this.db.query<{ total: string; resolvidas: string; criticas: string }>(
          `SELECT
             COUNT(*)::text AS total,
             COUNT(*) FILTER (WHERE status = 'resolvida')::text AS resolvidas,
             COUNT(*) FILTER (WHERE prioridade = 'critica')::text AS criticas
           FROM felipe_system.conversas
           WHERE sistema_id = $1 AND iniciada_em BETWEEN $2 AND $3`,
          params,
        ),
        this.db.query<{ status: string; total: string }>(
          `SELECT status, COUNT(*)::text AS total FROM felipe_system.conversas
           WHERE sistema_id = $1 AND iniciada_em BETWEEN $2 AND $3
           GROUP BY status`,
          params,
        ),
        this.db.query<{ prioridade: string; total: string }>(
          `SELECT prioridade, COUNT(*)::text AS total FROM felipe_system.conversas
           WHERE sistema_id = $1 AND iniciada_em BETWEEN $2 AND $3 AND prioridade IS NOT NULL
           GROUP BY prioridade`,
          params,
        ),
        this.db.query<{ data: string; total: string }>(
          `SELECT to_char(date_trunc('day', iniciada_em), 'YYYY-MM-DD') AS data, COUNT(*)::text AS total
           FROM felipe_system.conversas
           WHERE sistema_id = $1 AND iniciada_em BETWEEN $2 AND $3
           GROUP BY 1 ORDER BY 1`,
          params,
        ),
        this.db.query<{ total: string }>(
          `SELECT COALESCE(SUM((e.detalhes->>'valor')::numeric), 0)::text AS total
           FROM felipe_system.eventos e
           JOIN felipe_system.conversas c ON c.id = e.conversa_id
           WHERE c.sistema_id = $1 AND e.tipo = 'pagamento_confirmado' AND e.criado_em BETWEEN $2 AND $3`,
          params,
        ),
        this.db.query<{ media: string | null }>(
          `SELECT AVG(EXTRACT(EPOCH FROM (e.criado_em - c.assumida_em)) / 60)::text AS media
           FROM felipe_system.eventos e
           JOIN felipe_system.conversas c ON c.id = e.conversa_id
           WHERE c.sistema_id = $1 AND c.iniciada_em BETWEEN $2 AND $3
             AND e.tipo = 'conversa_resolvida' AND c.assumida_em IS NOT NULL`,
          params,
        ),
        this.db.query<{ usuario_id: number; nome: string; assumidas: string; resolvidas: string }>(
          `SELECT u.id AS usuario_id, u.nome,
             COUNT(*) FILTER (WHERE e.tipo = 'conversa_assumida')::text AS assumidas,
             COUNT(*) FILTER (WHERE e.tipo = 'conversa_resolvida')::text AS resolvidas
           FROM felipe_system.eventos e
           JOIN felipe_system.conversas c ON c.id = e.conversa_id
           JOIN felipe_system.usuarios u ON u.id = (e.detalhes->>'usuario_id')::int
           WHERE c.sistema_id = $1 AND c.iniciada_em BETWEEN $2 AND $3
             AND e.tipo IN ('conversa_assumida', 'conversa_resolvida')
           GROUP BY u.id, u.nome
           ORDER BY (COUNT(*) FILTER (WHERE e.tipo = 'conversa_assumida') + COUNT(*) FILTER (WHERE e.tipo = 'conversa_resolvida')) DESC
           LIMIT 10`,
          params,
        ),
      ]);

    const distribuicaoPorStatus: DistribuicaoPorStatus[] = porStatus.rows.map((r) => ({
      status: r.status as StatusConversa,
      total: Number(r.total),
    }));

    const distribuicaoPorPrioridade: DistribuicaoPorPrioridade[] = porPrioridade.rows.map((r) => ({
      prioridade: r.prioridade as PrioridadeConversa,
      total: Number(r.total),
    }));

    const volumePorDia: VolumeDoDia[] = porDia.rows.map((r) => ({ data: r.data, total: Number(r.total) }));

    const operadores: DesempenhoOperador[] = porOperador.rows.map((r) => ({
      usuarioId: r.usuario_id,
      nome: r.nome,
      assumidas: Number(r.assumidas),
      resolvidas: Number(r.resolvidas),
    }));

    return {
      totalConversas: Number(contagens.rows[0]?.total ?? 0),
      conversasResolvidas: Number(contagens.rows[0]?.resolvidas ?? 0),
      conversasCriticas: Number(contagens.rows[0]?.criticas ?? 0),
      valorTotalConfirmado: Number(valorConfirmado.rows[0]?.total ?? 0),
      tempoMedioAtendimentoMinutos: tempoMedio.rows[0]?.media != null ? Number(tempoMedio.rows[0].media) : null,
      distribuicaoPorStatus,
      distribuicaoPorPrioridade,
      volumePorDia,
      porOperador: operadores,
    };
  }
}
