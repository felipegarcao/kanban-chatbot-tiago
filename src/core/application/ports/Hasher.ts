export interface Hasher {
  hash(senha: string): Promise<string>;
  verificar(senha: string, hash: string): Promise<boolean>;
}
