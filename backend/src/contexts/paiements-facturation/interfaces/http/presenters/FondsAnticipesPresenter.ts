import type { FondsAnticipesReadModel } from '../../../application/read-models/FondsAnticipesReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class FondsAnticipesPresenter {
  public static presenterLecture(
    lecture: FondsAnticipesReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idEcole: lecture.idEcole,
      dateDebut: lecture.dateDebut,
      dateFin: lecture.dateFin,
      totalFondsAnticipes: PresentationHttpPaiementsFacturation.presenterMontant(
        lecture.totalFondsAnticipes,
      ),
      lignes: lecture.lignes.map((ligne) => ({
        origineAffectation: ligne.origineAffectation,
        total: PresentationHttpPaiementsFacturation.presenterMontant(ligne.total),
      })),
    });
  }
}
