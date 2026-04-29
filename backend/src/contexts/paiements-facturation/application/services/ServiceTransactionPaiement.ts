import { ErreurTransactionPaiement } from '../exceptions/ErreurTransactionPaiement';

export interface UniteTravailPaiement {
  executerDansTransaction<TSortie>(operation: () => Promise<TSortie>): Promise<TSortie>;
}

export class ServiceTransactionPaiement {
  constructor(private readonly uniteTravail: UniteTravailPaiement) {}

  public async executer<TSortie>(operation: () => Promise<TSortie>): Promise<TSortie> {
    try {
      return await this.uniteTravail.executerDansTransaction(operation);
    } catch (erreur) {
      throw new ErreurTransactionPaiement(
        erreur instanceof Error ? erreur.message : 'La transaction paiement a echoue.',
      );
    }
  }
}
