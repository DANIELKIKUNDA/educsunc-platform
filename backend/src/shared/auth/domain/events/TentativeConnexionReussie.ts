import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une tentative de connexion vient de reussir.
export class TentativeConnexionReussie extends EvenementDomaine {
  constructor(public readonly idTentativeConnexion: string, public readonly email: string) {
    super('TentativeConnexionReussie');
  }
}
