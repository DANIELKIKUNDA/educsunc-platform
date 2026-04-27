import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative d'idempotence.
/**
 * Cette erreur signale une cle idempotente absente, rejouee ou incoherente.
 */
export class ErreurIdempotence extends ErreurApplication {
  constructor(message = 'La commande idempotente est invalide.') {
    super(message, 'ERREUR_IDEMPOTENCE_APPLICATION_SCOLARITE_ELEVES');
    this.name = 'ErreurIdempotence';
  }
}
