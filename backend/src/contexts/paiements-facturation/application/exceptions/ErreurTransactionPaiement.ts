import { ErreurApplicationPaiements } from './ErreurApplicationPaiements';

export class ErreurTransactionPaiement extends ErreurApplicationPaiements {
  constructor(message = 'La transaction financiere n a pas pu aboutir.') {
    super(message, 'ERREUR_TRANSACTION_PAIEMENT');
    this.name = 'ErreurTransactionPaiement';
  }
}
