import type { SyntheseFinanciereSectionReadModel } from '../../../application/read-models/SyntheseFinanciereSectionReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class SyntheseFinanciereSectionPresenter {
  public static presenterLecture(
    lecture: SyntheseFinanciereSectionReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idOrganisation: lecture.idOrganisation,
      idEcole: lecture.idEcole,
      idAnneeScolaire: lecture.idAnneeScolaire,
      idSectionScolaire: lecture.idSectionScolaire,
      moisAnalyseJusqua: lecture.moisAnalyseJusqua,
      typeFrais: lecture.typeFrais,
      lignes: lecture.lignes.map((ligne) => ({
        idClassePedagogique: ligne.idClassePedagogique,
        classe: ligne.classe,
        effectifTotal: ligne.effectifTotal,
        elevesRedevables: ligne.elevesRedevables,
        elevesEnOrdre: ligne.elevesEnOrdre,
        elevesNonEnOrdre: ligne.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantAttendu),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantPaye),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(ligne.resteARecouvrer),
        tauxRecouvrement: ligne.tauxRecouvrement,
      })),
      totalGeneralSection: {
        effectifTotal: lecture.totalGeneralSection.effectifTotal,
        elevesRedevables: lecture.totalGeneralSection.elevesRedevables,
        elevesEnOrdre: lecture.totalGeneralSection.elevesEnOrdre,
        elevesNonEnOrdre: lecture.totalGeneralSection.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralSection.montantAttendu,
        ),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralSection.montantPaye,
        ),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralSection.resteARecouvrer,
        ),
        tauxRecouvrement: lecture.totalGeneralSection.tauxRecouvrement,
      },
    });
  }
}
