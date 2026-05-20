// Ce port ouvre une transaction applicative pour les orchestrations AUTH critiques.
export interface TransactionManagerPort {
  executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}
