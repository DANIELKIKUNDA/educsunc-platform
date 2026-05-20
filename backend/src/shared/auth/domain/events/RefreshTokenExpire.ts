import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un refresh token est constate comme expire.
export class RefreshTokenExpire extends EvenementDomaine {
  constructor(public readonly idRefreshToken: string, public readonly idUtilisateur: string) {
    super('RefreshTokenExpire');
  }
}
