import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de transaction.
/**
 * Cette erreur signale l'echec d'une transaction locale.
 */
export class ErreurTransaction extends ErreurApplication {
  constructor(message = 'La transaction applicative a echoue.') {
    super(message, 'ERREUR_TRANSACTION_SCOLARITE_ELEVES');
    this.name = 'ErreurTransaction';
  }
}
