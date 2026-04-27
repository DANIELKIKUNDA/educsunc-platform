import { ErreurApplication } from './ErreurApplication';

// Ce fichier contient l'erreur applicative pour les ressources absentes.
/**
 * Cette erreur indique qu'un agregat ou une lecture demandee n'existe pas.
 */
export class ErreurRessourceIntrouvable extends ErreurApplication {
  constructor(message = 'La ressource demandee est introuvable.') {
    super(message, 'ERREUR_RESSOURCE_INTROUVABLE_SCOLARITE_ELEVES');
    this.name = 'ErreurRessourceIntrouvable';
  }
}
