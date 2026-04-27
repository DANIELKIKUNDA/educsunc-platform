import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de synchronisation.
/**
 * Cette erreur signale un probleme de preparation ou de resolution de synchronisation.
 */
export class ErreurSynchronisation extends ErreurApplication {
  constructor(message = 'La synchronisation applicative a echoue.') {
    super(message, 'ERREUR_SYNCHRONISATION_SCOLARITE_ELEVES');
    this.name = 'ErreurSynchronisation';
  }
}
