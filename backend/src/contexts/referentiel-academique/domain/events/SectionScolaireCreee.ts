import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';

// Cet evenement de domaine trace la creation d'une section scolaire.
export class SectionScolaireCreee extends EvenementDomaine {
  private readonly idSectionScolaire: SectionScolaireId;

  // Ce constructeur initialise l'identifiant de la section scolaire concernee.
  constructor(idSectionScolaire: SectionScolaireId) {
    super('SectionScolaireCreee');
    this.idSectionScolaire = idSectionScolaire;
  }

  // Cette methode retourne l'identifiant de la section scolaire concernee.
  public obtenirIdSectionScolaire(): SectionScolaireId {
    return this.idSectionScolaire;
  }
}
