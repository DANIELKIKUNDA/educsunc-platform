import type { SyntheseFinanciereOrganisationReadModel } from '../../../application/read-models/SyntheseFinanciereOrganisationReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class SyntheseFinanciereOrganisationPresenter {
  public static presenterLecture(
    lecture: SyntheseFinanciereOrganisationReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idOrganisation: lecture.idOrganisation,
      idAnneeScolaire: lecture.idAnneeScolaire,
      moisAnalyseJusqua: lecture.moisAnalyseJusqua,
      typeFrais: lecture.typeFrais,
      lignes: lecture.lignes.map((ligne) => ({
        idEcole: ligne.idEcole,
        ecole: ligne.ecole,
        effectifTotal: ligne.effectifTotal,
        elevesRedevables: ligne.elevesRedevables,
        elevesEnOrdre: ligne.elevesEnOrdre,
        elevesNonEnOrdre: ligne.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantAttendu),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantPaye),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(ligne.resteARecouvrer),
        tauxRecouvrement: ligne.tauxRecouvrement,
      })),
      totalGeneralOrganisation: {
        effectifTotal: lecture.totalGeneralOrganisation.effectifTotal,
        elevesRedevables: lecture.totalGeneralOrganisation.elevesRedevables,
        elevesEnOrdre: lecture.totalGeneralOrganisation.elevesEnOrdre,
        elevesNonEnOrdre: lecture.totalGeneralOrganisation.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralOrganisation.montantAttendu,
        ),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralOrganisation.montantPaye,
        ),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.totalGeneralOrganisation.resteARecouvrer,
        ),
        tauxRecouvrement: lecture.totalGeneralOrganisation.tauxRecouvrement,
      },
    });
  }
}
