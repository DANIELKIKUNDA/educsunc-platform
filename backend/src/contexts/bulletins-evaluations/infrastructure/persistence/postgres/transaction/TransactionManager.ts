// Declenche les transactions du contexte bulletins evaluations.
export interface TransactionManager {
  executer<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}
