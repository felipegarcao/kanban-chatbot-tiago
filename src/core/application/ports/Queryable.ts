/**
 * Contrato mínimo que `pg.Pool` e `pg.PoolClient` satisfazem em comum. Repositórios recebem
 * isso no construtor para funcionar tanto fora de transação (pool) quanto dentro de uma
 * (client de uma transação aberta pelo UnitOfWork), sem duas implementações por repositório.
 */
export interface Queryable {
  query<T extends object = Record<string, unknown>>(
    text: string,
    params?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
}
