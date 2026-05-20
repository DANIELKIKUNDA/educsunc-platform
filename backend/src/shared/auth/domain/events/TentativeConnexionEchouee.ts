import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une tentative de connexion vient d'echouer.
export class TentativeConnexionEchouee extends EvenementDomaine {
  constructor(public readonly idTentativeConnexion: string, public readonly email: string, public readonly raisonEchec?: string) {
    super('TentativeConnexionEchouee');
  }
}
