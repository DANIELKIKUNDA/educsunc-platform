import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative de dependance entre bounded contexts.
/**
 * Cette erreur signale qu'un port vers un autre BC n'a pas pu satisfaire la demande.
 */
export class ErreurDependanceInterBC extends ErreurApplication {
  constructor(message = 'Une dependance inter-BC est indisponible ou incoherente.') {
    super(message, 'ERREUR_DEPENDANCE_INTER_BC_SCOLARITE_ELEVES');
    this.name = 'ErreurDependanceInterBC';
  }
}
