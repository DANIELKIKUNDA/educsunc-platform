import type { SyntheseFinanciereClasseReadModel } from '../../../application/read-models/SyntheseFinanciereClasseReadModel';
import { PresentationHttpPaiementsFacturation } from './PresentationHttpPaiementsFacturation';

export class SyntheseFinanciereClassePresenter {
  public static presenterLecture(
    lecture: SyntheseFinanciereClasseReadModel,
  ): { donnee: unknown } {
    return PresentationHttpPaiementsFacturation.detail({
      idOrganisation: lecture.idOrganisation,
      idEcole: lecture.idEcole,
      idAnneeScolaire: lecture.idAnneeScolaire,
      idClassePedagogique: lecture.idClassePedagogique,
      moisAnalyseJusqua: lecture.moisAnalyseJusqua,
      typeFrais: lecture.typeFrais,
      lignes: lecture.lignes.map((ligne) => ({
        code: ligne.code,
        libelle: ligne.libelle,
        ordre: ligne.ordre,
        moisScolaire: ligne.moisScolaire,
        typeFrais: ligne.typeFrais,
        effectifTotal: ligne.effectifTotal,
        elevesRedevables: ligne.elevesRedevables,
        elevesEnOrdre: ligne.elevesEnOrdre,
        elevesNonEnOrdre: ligne.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantAttendu),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(ligne.montantPaye),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(ligne.resteARecouvrer),
        tauxRecouvrement: ligne.tauxRecouvrement,
      })),
      situationActuelle: {
        effectifTotal: lecture.situationActuelle.effectifTotal,
        elevesRedevables: lecture.situationActuelle.elevesRedevables,
        elevesEnOrdre: lecture.situationActuelle.elevesEnOrdre,
        elevesNonEnOrdre: lecture.situationActuelle.elevesNonEnOrdre,
        montantAttendu: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.situationActuelle.montantAttendu,
        ),
        montantPaye: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.situationActuelle.montantPaye,
        ),
        resteARecouvrer: PresentationHttpPaiementsFacturation.presenterMontant(
          lecture.situationActuelle.resteARecouvrer,
        ),
        tauxRecouvrement: lecture.situationActuelle.tauxRecouvrement,
      },
    });
  }
}
