import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative d'autorisation.
/**
 * Cette erreur indique que l'utilisateur ne peut pas executer l'operation demandee.
 */
export class ErreurAutorisation extends ErreurApplication {
  constructor(message = 'L operation n est pas autorisee.') {
    super(message, 'ERREUR_AUTORISATION_SCOLARITE_ELEVES');
    this.name = 'ErreurAutorisation';
  }
}
