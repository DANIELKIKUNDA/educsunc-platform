import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { OrganisationId } from '../value-objects/OrganisationId';

// Cet evenement de domaine trace la creation d'une organisation.
export class OrganisationCreee extends EvenementDomaine {
  private readonly idOrganisation: OrganisationId;

  // Ce constructeur initialise l'identifiant de l'organisation concernee.
  constructor(idOrganisation: OrganisationId) {
    super('OrganisationCreee');
    this.idOrganisation = idOrganisation;
  }

  // Cette methode retourne l'identifiant de l'organisation concernee.
  public obtenirIdOrganisation(): OrganisationId {
    return this.idOrganisation;
  }
}
