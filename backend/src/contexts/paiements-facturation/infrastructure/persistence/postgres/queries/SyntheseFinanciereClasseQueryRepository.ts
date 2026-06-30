import { Money } from '../../../../domain/value-objects/Money';
import type { RegistreFinancierClasseCelluleReadModel } from '../../../../application/read-models/RegistreFinancierClasseReadModel';
import type { SyntheseFinanciereClasseReadModel } from '../../../../application/read-models/SyntheseFinanciereClasseReadModel';
import type { RegistreFinancierClasseRepository } from '../../../../application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase';
import type { SyntheseFinanciereClasseRepository } from '../../../../application/use-cases/rapports/ConsulterSyntheseFinanciereClasseUseCase';

const STATUTS_HORS_CALCUL = new Set(['AB', 'TR', 'DC']);

export class SyntheseFinanciereClasseQueryRepository
  implements SyntheseFinanciereClasseRepository
{
  constructor(
    private readonly registreRepository: RegistreFinancierClasseRepository,
  ) {}

  public async consulterSyntheseClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereClasseReadModel> {
    const registre = await this.registreRepository.consulterRegistreClasse({
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
    });

    const colonnesMois = registre.colonnes
      .filter((colonne) =>
        colonne.type === 'MOIS'
        && (params.typeFrais === undefined || colonne.typeFrais === params.typeFrais))
      .sort((gauche, droite) => gauche.ordre - droite.ordre);

    const lignes = colonnesMois.map((colonne) => {
      const statistique = registre.statistiquesParColonne.find(
        (element) => element.colonneCode === colonne.code,
      );
      const cellules = registre.lignes.map((ligne) =>
        ligne.cellules.find((cellule) => cellule.colonneCode === colonne.code))
        .filter((cellule): cellule is RegistreFinancierClasseCelluleReadModel => cellule !== undefined);

      const effectifTotal = cellules.filter((cellule) =>
        !STATUTS_HORS_CALCUL.has(cellule.statutAffiche ?? '')).length;

      return {
        code: colonne.code,
        libelle: colonne.libelle,
        ordre: colonne.ordre,
        moisScolaire: colonne.moisScolaire ?? colonne.libelle.toUpperCase(),
        typeFrais: colonne.typeFrais,
        effectifTotal,
        elevesRedevables: statistique?.elevesRedevables ?? 0,
        elevesEnOrdre: statistique?.elevesEnOrdre ?? 0,
        elevesNonEnOrdre: statistique?.elevesNonEnOrdre ?? 0,
        montantAttendu: statistique?.montantAttendu ?? new Money(0, 'CDF'),
        montantPaye: statistique?.montantPaye ?? new Money(0, 'CDF'),
        resteARecouvrer: statistique?.resteARecouvrer ?? new Money(0, 'CDF'),
        tauxRecouvrement: statistique?.tauxRecouvrement ?? 0,
      };
    });

    const lignesActives = registre.lignes.filter((ligne) =>
      !['ABANDONNE', 'TRANSFERE', 'DECEDE'].includes(ligne.statutScolaire));
    const cellulesActives = lignesActives.flatMap((ligne) =>
      ligne.cellules.filter((cellule) =>
        colonneCorrespondAuFiltre(cellule.colonneCode, registre.colonnes, params.typeFrais)));

    const montantAttendu = cellulesActives.reduce(
      (total, cellule) => total + cellule.montantAttendu.obtenirMontant(),
      0,
    );
    const montantPaye = cellulesActives.reduce(
      (total, cellule) => total + cellule.montantPaye.obtenirMontant(),
      0,
    );
    const resteARecouvrer = cellulesActives.reduce(
      (total, cellule) => total + cellule.resteARecouvrer.obtenirMontant(),
      0,
    );
    const elevesRedevables = lignesActives.filter((ligne) =>
      ligne.cellules.some((cellule) =>
        colonneCorrespondAuFiltre(cellule.colonneCode, registre.colonnes, params.typeFrais)
        && cellule.estRedevable)).length;
    const elevesEnOrdre = lignesActives.filter((ligne) => {
      const cellulesEligibles = ligne.cellules.filter((cellule) =>
        colonneCorrespondAuFiltre(cellule.colonneCode, registre.colonnes, params.typeFrais)
        && cellule.estRedevable);
      return cellulesEligibles.length > 0 && cellulesEligibles.every((cellule) => cellule.estEnOrdre);
    }).length;
    const elevesNonEnOrdre = Math.max(elevesRedevables - elevesEnOrdre, 0);

    return {
      idOrganisation: registre.idOrganisation,
      idEcole: registre.idEcole,
      idAnneeScolaire: registre.idAnneeScolaire,
      idClassePedagogique: registre.idClassePedagogique,
      moisAnalyseJusqua: registre.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes,
      situationActuelle: {
        effectifTotal: lignesActives.length,
        elevesRedevables,
        elevesEnOrdre,
        elevesNonEnOrdre,
        montantAttendu: new Money(montantAttendu, 'CDF'),
        montantPaye: new Money(montantPaye, 'CDF'),
        resteARecouvrer: new Money(resteARecouvrer, 'CDF'),
        tauxRecouvrement: montantAttendu === 0
          ? 0
          : Number(((montantPaye / montantAttendu) * 100).toFixed(2)),
      },
    };
  }
}

function colonneCorrespondAuFiltre(
  colonneCode: string,
  colonnes: ReadonlyArray<{ code: string; type: string; typeFrais?: string }>,
  typeFrais?: string,
): boolean {
  const colonne = colonnes.find((element) => element.code === colonneCode);
  if (colonne === undefined) {
    return false;
  }
  if (colonne.type !== 'MOIS') {
    return false;
  }
  if (typeFrais === undefined) {
    return true;
  }
  return colonne.typeFrais === typeFrais;
}
