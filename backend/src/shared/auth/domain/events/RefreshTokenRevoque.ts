import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un refresh token a ete revoque.
export class RefreshTokenRevoque extends EvenementDomaine {
  constructor(public readonly idRefreshToken: string, public readonly idUtilisateur: string) {
    super('RefreshTokenRevoque');
  }
}
