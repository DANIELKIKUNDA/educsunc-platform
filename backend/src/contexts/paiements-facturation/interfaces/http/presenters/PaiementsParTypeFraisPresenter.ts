import type { PaiementsParTypeFraisReadModel } from '../../../application/read-models/PaiementsParTypeFraisReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class PaiementsParTypeFraisPresenter {
  public static presenterLecture(
    lecture: PaiementsParTypeFraisReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEcole: lecture.idEcole,
      dateDebut: lecture.dateDebut,
      dateFin: lecture.dateFin,
      lignes: lecture.lignes.map((ligne) => ({
        typeFrais: ligne.typeFrais,
        total: PresentationHttpPaiementsFacturation.presenterMontant(ligne.total),
      })),
    });
  }
}
