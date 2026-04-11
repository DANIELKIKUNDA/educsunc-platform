import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';

// Cet evenement de domaine trace la desactivation d'un referentiel de cours.
export class ReferentielCoursDesactive extends EvenementDomaine {
  private readonly idReferentielCours: ReferentielCoursId;

  // Ce constructeur initialise l'identifiant du referentiel de cours concerne.
  constructor(idReferentielCours: ReferentielCoursId) {
    super('ReferentielCoursDesactive');
    this.idReferentielCours = idReferentielCours;
  }

  // Cette methode retourne l'identifiant du referentiel de cours concerne.
  public obtenirIdReferentielCours(): ReferentielCoursId {
    return this.idReferentielCours;
  }
}
