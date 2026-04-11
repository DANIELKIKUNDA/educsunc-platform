import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';

// Cet evenement de domaine trace la creation d'une annee scolaire.
export class AnneeScolaireCreee extends EvenementDomaine {
  private readonly idAnneeScolaire: AnneeScolaireId;

  // Ce constructeur initialise l'identifiant de l'annee scolaire concernee.
  constructor(idAnneeScolaire: AnneeScolaireId) {
    super('AnneeScolaireCreee');
    this.idAnneeScolaire = idAnneeScolaire;
  }

  // Cette methode retourne l'identifiant de l'annee scolaire concernee.
  public obtenirIdAnneeScolaire(): AnneeScolaireId {
    return this.idAnneeScolaire;
  }
}
