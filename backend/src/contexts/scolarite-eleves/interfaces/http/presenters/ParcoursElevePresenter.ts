import { EvenementParcoursSortieDTO } from '../../../application/dto/output/EvenementParcoursSortieDTO';
import { ParcoursEleveSortieDTO } from '../../../application/dto/output/ParcoursEleveSortieDTO';
import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les parcours eleves en reponses HTTP.
export class ParcoursElevePresenter {
  /** Presente un parcours complet. */
  public static presenterParcours(parcours: ParcoursEleveSortieDTO) { return PresenterHttpScolarite.detail(parcours); }
  /** Presente une liste d'evenements. */
  public static presenterEvenements(evenements: EvenementParcoursSortieDTO[]) { return PresenterHttpScolarite.liste(evenements); }
}
