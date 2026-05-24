// Ce port ouvre une transaction applicative courte pour les orchestrations Audit critiques.
export interface AuditTransactionPort {
  executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult>;
}

