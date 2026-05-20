import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'un utilisateur a ete authentifie avec succes.
export class UtilisateurAuthentifie extends EvenementDomaine {
  constructor(
    public readonly idUtilisateur: string,
    public readonly organisationActiveId?: string,
    public readonly ecoleActiveId?: string,
  ) {
    super('UtilisateurAuthentifie');
  }
}
