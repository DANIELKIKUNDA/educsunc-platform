import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une session persistante vient d'etre ouverte.
export class SessionOuverte extends EvenementDomaine {
  constructor(public readonly idSessionUtilisateur: string, public readonly idUtilisateur: string) {
    super('SessionOuverte');
  }
}
