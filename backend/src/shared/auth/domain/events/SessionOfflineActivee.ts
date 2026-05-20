import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une session bascule en mode offline.
export class SessionOfflineActivee extends EvenementDomaine {
  constructor(public readonly idSessionUtilisateur: string, public readonly idUtilisateur: string) {
    super('SessionOfflineActivee');
  }
}
