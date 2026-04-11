import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';

// Cet evenement de domaine trace le chargement d'un referentiel de cours.
export class ReferentielCoursCharge extends EvenementDomaine {
  private readonly idReferentielCours: ReferentielCoursId;

  // Ce constructeur initialise l'identifiant du referentiel de cours concerne.
  constructor(idReferentielCours: ReferentielCoursId) {
    super('ReferentielCoursCharge');
    this.idReferentielCours = idReferentielCours;
  }

  // Cette methode retourne l'identifiant du referentiel de cours concerne.
  public obtenirIdReferentielCours(): ReferentielCoursId {
    return this.idReferentielCours;
  }
}
