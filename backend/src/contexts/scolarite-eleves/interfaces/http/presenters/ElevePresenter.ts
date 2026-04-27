import { EleveDetailSortieDTO } from '../../../application/dto/output/EleveDetailSortieDTO';
import { EleveSortieDTO } from '../../../application/dto/output/EleveSortieDTO';
import { PageResultatSortieDTO } from '../../../application/dto/output/PageResultatSortieDTO';
import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les sorties eleves en reponses HTTP.
export class ElevePresenter {
  /** Presente un eleve detaille. */
  public static presenterEleve(eleve: EleveDetailSortieDTO) { return PresenterHttpScolarite.detail(eleve); }
  /** Presente une liste d'eleves. */
  public static presenterListe(sortie: PageResultatSortieDTO<EleveSortieDTO>) { return PresenterHttpScolarite.liste(sortie); }
}
