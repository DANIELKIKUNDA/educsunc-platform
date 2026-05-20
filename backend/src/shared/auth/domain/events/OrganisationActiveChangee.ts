import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale qu'une organisation active de session a ete modifiee.
export class OrganisationActiveChangee extends EvenementDomaine {
  constructor(public readonly idSessionUtilisateur: string, public readonly organisationActiveId?: string) {
    super('OrganisationActiveChangee');
  }
}
