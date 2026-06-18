import type { PaiementsParCaissierReadModel } from '../../../application/read-models/PaiementsParCaissierReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class PaiementsParCaissierPresenter {
  public static presenterLecture(
    lecture: PaiementsParCaissierReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEcole: lecture.idEcole,
      dateDebut: lecture.dateDebut,
      dateFin: lecture.dateFin,
      lignes: lecture.lignes.map((ligne) => ({
        idCaissier: ligne.idCaissier,
        total: PresentationHttpPaiementsFacturation.presenterMontant(ligne.total),
      })),
    });
  }
}
