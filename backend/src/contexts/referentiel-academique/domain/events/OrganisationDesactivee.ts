import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { OrganisationId } from '../value-objects/OrganisationId';

// Cet evenement de domaine trace la desactivation d'une organisation.
export class OrganisationDesactivee extends EvenementDomaine {
  private readonly idOrganisation: OrganisationId;

  // Ce constructeur initialise l'identifiant de l'organisation concernee.
  constructor(idOrganisation: OrganisationId) {
    super('OrganisationDesactivee');
    this.idOrganisation = idOrganisation;
  }

  // Cette methode retourne l'identifiant de l'organisation concernee.
  public obtenirIdOrganisation(): OrganisationId {
    return this.idOrganisation;
  }
}
