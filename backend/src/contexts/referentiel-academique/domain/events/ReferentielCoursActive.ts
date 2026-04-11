import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';

// Cet evenement de domaine trace l'activation d'un referentiel de cours.
export class ReferentielCoursActive extends EvenementDomaine {
  private readonly idReferentielCours: ReferentielCoursId;

  // Ce constructeur initialise l'identifiant du referentiel de cours concerne.
  constructor(idReferentielCours: ReferentielCoursId) {
    super('ReferentielCoursActive');
    this.idReferentielCours = idReferentielCours;
  }

  // Cette methode retourne l'identifiant du referentiel de cours concerne.
  public obtenirIdReferentielCours(): ReferentielCoursId {
    return this.idReferentielCours;
  }
}
