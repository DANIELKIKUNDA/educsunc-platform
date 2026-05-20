import { EvenementDomaine } from '../../../domain/DomainEvent';

export class OrganisationActiveChangee extends EvenementDomaine {
  constructor(public readonly idContexteActifUtilisateur: string, public readonly idOrganisationActive?: string) {
    super('OrganisationActiveChangee');
  }
}
