// Ce contrat definit le declenchement d'une transaction depuis la couche application.
export interface ServiceTransactionApplication {
  // Cette methode execute une operation applicative dans une transaction atomique.
  executerDansTransaction<TValeur>(operation: () => Promise<TValeur>): Promise<TValeur>;
}

// Cette implementation par defaut preserve le comportement existant tant qu'aucune infrastructure transactionnelle n'est branchee.
export class ServiceTransactionApplicationSansEffet
  implements ServiceTransactionApplication
{
  // Cette methode execute simplement l'operation sans ouvrir de transaction technique.
  public executerDansTransaction<TValeur>(
    operation: () => Promise<TValeur>,
  ): Promise<TValeur> {
    return operation();
  }
}
