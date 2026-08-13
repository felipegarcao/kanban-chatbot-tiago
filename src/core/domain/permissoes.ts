import { SemPermissaoNoProjeto } from "./errors/DomainError";
import { PermissaoDeAdminNecessaria } from "./errors/DomainError";
import type { Papel } from "./Usuario";

/**
 * Barreira de permissão por projeto. Fica no domínio (chamada pelo caso de uso, não pelo
 * middleware) porque o middleware é conveniência de UX e o caso de uso é a garantia real:
 * um operador que forjar o sistemaId de outro projeto tem que receber 403 vindo daqui.
 */
export function garantirAcessoAoProjeto(sistemaId: number, sistemasPermitidos: readonly number[]): void {
  if (!sistemasPermitidos.includes(sistemaId)) {
    throw new SemPermissaoNoProjeto(sistemaId);
  }
}

/** Mesma lógica: a garantia real de que a área admin é admin-only mora no caso de uso. */
export function garantirAdmin(papel: Papel): void {
  if (papel !== "admin") {
    throw new PermissaoDeAdminNecessaria();
  }
}
