// Ce fichier definit le contrat de transaction locale ouvert depuis la couche application.
/**
 * Ce service execute une operation applicative dans une transaction technique fournie par l'infrastructure.
 */
export interface ServiceTransactionApplication {
  /** Execute une operation dans une transaction atomique. */
  executerDansTransaction<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}

/**
 * Cette implementation par defaut laisse les tests et usages sans infrastructure avancer sans transaction technique.
 */
export class ServiceTransactionApplicationSansEffet implements ServiceTransactionApplication {
  /** Execute l'operation sans ouvrir de transaction technique. */
  public executerDansTransaction<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur> {
    return operation();
  }
}
