import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un contexte actif utilisateur vient d'etre modifie.
export class ContexteActifChange extends EvenementDomaine {
  constructor(public readonly idContexteActifAuth: string, public readonly idUtilisateur: string) {
    super('ContexteActifChange');
  }
}
