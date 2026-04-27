import { AffectationClasseSortieDTO } from '../../../application/dto/output/AffectationClasseSortieDTO';
import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les affectations de classes en reponses HTTP.
export class AffectationClassePresenter {
  /** Presente une affectation. */
  public static presenterAffectation(affectation: AffectationClasseSortieDTO) { return PresenterHttpScolarite.detail(affectation); }
  /** Presente une liste d'affectations. */
  public static presenterListe(affectations: AffectationClasseSortieDTO[]) { return PresenterHttpScolarite.liste(affectations); }
}
