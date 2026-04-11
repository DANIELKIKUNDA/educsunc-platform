// Declenche les transactions du contexte scolarite eleves.
export interface TransactionManager {
  executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}
