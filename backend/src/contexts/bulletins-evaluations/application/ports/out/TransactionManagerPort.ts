// Ce port abstrait l'execution d'une unite de travail transactionnelle.
export interface TransactionManagerPort {
  executer<TSortie>(operation: () => Promise<TSortie>): Promise<TSortie>;
}
