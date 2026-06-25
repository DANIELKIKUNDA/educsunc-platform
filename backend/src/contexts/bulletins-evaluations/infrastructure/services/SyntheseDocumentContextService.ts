import type { ReferentielAcademiquePort } from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';

export interface SyntheseDocumentContext {
  identiteInstitutionnelle: {
    nomEcole: string;
    codeEcole?: string;
    sigleEcole?: string;
    adresseEcole?: string;
    telephoneEcole?: string;
    emailEcole?: string;
    provinceEducationnelle?: string;
    ville?: string;
    communeOuTerritoire?: string;
  };
  meta: {
    libelleAnneeScolaire?: string;
    libellePeriode: string;
    dateEditionDocument: string;
  };
}

function formaterDateDocumentaire(date: Date): string {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();

  return `${jour}/${mois}/${annee}`;
}

function determinerLibellePeriode(synthese: SyntheseEcoleOutput): string {
  switch (synthese.codeColonne) {
    case CodeColonneBulletin.TOTAL_S1:
      return '1er semestre';
    case CodeColonneBulletin.TOTAL_S2:
      return '2eme semestre';
    case CodeColonneBulletin.TOTAL_T1:
      return '1er trimestre';
    case CodeColonneBulletin.TOTAL_T2:
      return '2eme trimestre';
    case CodeColonneBulletin.TOTAL_T3:
      return '3eme trimestre';
    case CodeColonneBulletin.TOTAL_GENERAL:
      return 'Resultats annuels';
    default:
      return synthese.typeSynthese.toLowerCase();
  }
}

// Ce service recharge le contexte documentaire d'une synthese avant rendu PDF.
export class SyntheseDocumentContextService {
  constructor(private readonly referentielAcademiquePort?: ReferentielAcademiquePort) {}

  public async charger(synthese: SyntheseEcoleOutput): Promise<SyntheseDocumentContext> {
    const [ecole, anneeScolaire] = await Promise.all([
      this.referentielAcademiquePort?.consulterEcole?.(synthese.idEcole) ?? Promise.resolve(null),
      this.referentielAcademiquePort?.consulterAnneeScolaire?.(synthese.idAnneeScolaire) ?? Promise.resolve(null),
    ]);

    return {
      identiteInstitutionnelle: {
        nomEcole: ecole?.nom ?? synthese.idEcole,
        codeEcole: ecole?.code,
        sigleEcole: ecole?.sigle,
        adresseEcole: ecole?.adresse,
        telephoneEcole: ecole?.telephone,
        emailEcole: ecole?.email,
        provinceEducationnelle: ecole?.provinceEducationnelle,
        ville: ecole?.ville,
        communeOuTerritoire: ecole?.communeOuTerritoire,
      },
      meta: {
        libelleAnneeScolaire: anneeScolaire?.libelle,
        libellePeriode: determinerLibellePeriode(synthese),
        dateEditionDocument: formaterDateDocumentaire(new Date()),
      },
    };
  }
}
