import { EvenementDomaine } from '../../../domain/DomainEvent';

// Cet evenement signale la selection explicite d'une organisation active.
export class OrganisationActiveSelectionnee extends EvenementDomaine {
  constructor(public readonly idContexteActifAuth: string, public readonly organisationActiveId?: string) {
    super('OrganisationActiveSelectionnee');
  }
}
