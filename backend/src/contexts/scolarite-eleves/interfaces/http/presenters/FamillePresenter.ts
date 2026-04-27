import { FamilleSortieDTO } from '../../../application/dto/output/FamilleSortieDTO';
import { PageResultatSortieDTO } from '../../../application/dto/output/PageResultatSortieDTO';
import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les sorties familles en reponses HTTP.
export class FamillePresenter {
  /** Presente une famille. */
  public static presenterFamille(famille: FamilleSortieDTO) { return PresenterHttpScolarite.detail(famille); }
  /** Presente une liste de familles. */
  public static presenterListe(sortie: PageResultatSortieDTO<FamilleSortieDTO>) { return PresenterHttpScolarite.liste(sortie); }
}
