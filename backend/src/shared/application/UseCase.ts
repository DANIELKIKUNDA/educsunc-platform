// Formalise un cas d'usage applicatif commun.
export interface UseCase<TEntree, TSortie> {
  executer(entree: TEntree): Promise<TSortie>;
}
