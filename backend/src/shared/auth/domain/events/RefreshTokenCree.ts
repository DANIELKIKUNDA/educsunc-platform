import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un refresh token vient d'etre cree.
export class RefreshTokenCree extends EvenementDomaine {
  constructor(public readonly idRefreshToken: string, public readonly idUtilisateur: string) {
    super('RefreshTokenCree');
  }
}
