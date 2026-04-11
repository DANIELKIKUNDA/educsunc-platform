import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';

// Cet evenement de domaine trace l'activation d'une annee scolaire.
export class AnneeScolaireActivee extends EvenementDomaine {
  private readonly idAnneeScolaire: AnneeScolaireId;

  // Ce constructeur initialise l'identifiant de l'annee scolaire concernee.
  constructor(idAnneeScolaire: AnneeScolaireId) {
    super('AnneeScolaireActivee');
    this.idAnneeScolaire = idAnneeScolaire;
  }

  // Cette methode retourne l'identifiant de l'annee scolaire concernee.
  public obtenirIdAnneeScolaire(): AnneeScolaireId {
    return this.idAnneeScolaire;
  }
}
