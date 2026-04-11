// Declenche les transactions du contexte paiements facturation.
export interface TransactionManager {
  executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}
