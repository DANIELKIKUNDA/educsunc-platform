import type { SyntheseFinanciereEcoleReadModel } from '../../../application/read-models/SyntheseFinanciereEcoleReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class SyntheseFinanciereEcolePresenter {
  public static presenterLecture(
    lecture: SyntheseFinanciereEcoleReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idOrganisation: lecture.idOrganisation,
      idEcole: lecture.idEcole,
      idAnneeScolaire: lecture.idAnneeScolaire,
      moisAnalyseJusqua: lecture.moisAnalyseJusqua,
      typeFrais: lecture.typeFrais,
      lignes: lecture.lignes.map((ligne) => ({
        idSectionScolaire: ligne.idSectionScolaire,
        section: ligne.section,
        effectifTotal: ligne.effectifTotal,
        elevesRedevables: ligne.elevesRedevables,
        elevesEnOrdre: ligne.elevesEnOrdre,
        elevesNonEnOrdre: ligne.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantAttendu),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantPaye),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(ligne.resteARecouvrer),
        tauxRecouvrement: ligne.tauxRecouvrement,
      })),
      totalGeneralEcole: {
        effectifTotal: lecture.totalGeneralEcole.effectifTotal,
        elevesRedevables: lecture.totalGeneralEcole.elevesRedevables,
        elevesEnOrdre: lecture.totalGeneralEcole.elevesEnOrdre,
        elevesNonEnOrdre: lecture.totalGeneralEcole.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralEcole.montantAttendu,
        ),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralEcole.montantPaye,
        ),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralEcole.resteARecouvrer,
        ),
        tauxRecouvrement: lecture.totalGeneralEcole.tauxRecouvrement,
      },
    });
  }
}
