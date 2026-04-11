import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { OrganisationId } from '../value-objects/OrganisationId';

// Cet evenement de domaine trace le renommage d'une organisation.
export class OrganisationRenommee extends EvenementDomaine {
  private readonly idOrganisation: OrganisationId;

  // Ce constructeur initialise l'identifiant de l'organisation concernee.
  constructor(idOrganisation: OrganisationId) {
    super('OrganisationRenommee');
    this.idOrganisation = idOrganisation;
  }

  // Cette methode retourne l'identifiant de l'organisation concernee.
  public obtenirIdOrganisation(): OrganisationId {
    return this.idOrganisation;
  }
}
