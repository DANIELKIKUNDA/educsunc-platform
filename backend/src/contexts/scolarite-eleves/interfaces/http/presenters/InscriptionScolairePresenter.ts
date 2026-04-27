import { InscriptionScolaireSortieDTO } from '../../../application/dto/output/InscriptionScolaireSortieDTO';
import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les inscriptions scolaires en reponses HTTP.
export class InscriptionScolairePresenter {
  /** Presente une inscription. */
  public static presenterInscription(inscription: InscriptionScolaireSortieDTO) { return PresenterHttpScolarite.detail(inscription); }
  /** Presente une liste d'inscriptions. */
  public static presenterListe(inscriptions: InscriptionScolaireSortieDTO[]) { return PresenterHttpScolarite.liste(inscriptions); }
}
