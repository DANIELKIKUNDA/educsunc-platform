import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de saga.
/**
 * Cette erreur signale qu'une saga applicative n'a pas pu avancer proprement.
 */
export class ErreurSaga extends ErreurApplication {
  constructor(message = 'La saga applicative a echoue.') {
    super(message, 'ERREUR_SAGA_SCOLARITE_ELEVES');
    this.name = 'ErreurSaga';
  }
}
