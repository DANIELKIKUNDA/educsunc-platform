import type { ProclamationTitulaireDocumentPort } from 'contexts/bulletins-evaluations/application/ports/out/ProclamationTitulaireDocumentPort';
import type { ReferentielAcademiquePort } from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { SectionClassePedagogiquePort } from 'contexts/bulletins-evaluations/application/ports/out/SectionClassePedagogiquePort';
import type {
  ProclamationDocumentContexteClasseReadModel,
  ProclamationDocumentIdentiteInstitutionnelleReadModel,
  ProclamationDocumentMetaReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeProclamation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeProclamation';

export interface ProclamationDocumentContextReadModel {
  meta?: Partial<ProclamationDocumentMetaReadModel>;
  identiteInstitutionnelle?: Partial<ProclamationDocumentIdentiteInstitutionnelleReadModel>;
  contexteClasse?: Partial<ProclamationDocumentContexteClasseReadModel>;
}

function formaterDateDocumentaire(date: Date): string {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();

  return `${jour}/${mois}/${annee}`;
}

function determinerLibellePeriode(
  codeColonne: CodeColonneBulletin,
  typeProclamation: TypeProclamation,
): string {
  switch (codeColonne) {
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
    case CodeColonneBulletin.EX1:
      return '1er examen';
    case CodeColonneBulletin.EX2:
      return '2eme examen';
    case CodeColonneBulletin.EX3:
      return '3eme examen';
    case CodeColonneBulletin.TOTAL_GENERAL:
      return 'Resultats annuels';
    default:
      switch (typeProclamation) {
        case TypeProclamation.SEMESTRE:
          return 'Resultats semestriels';
        case TypeProclamation.TRIMESTRE:
          return 'Resultats trimestriels';
        case TypeProclamation.EXAMEN:
          return "Resultats d'examen";
        case TypeProclamation.PERIODE:
          return 'Resultats de periode';
        default:
          return 'Resultats annuels';
      }
  }
}

// Ce service charge le contexte humain et institutionnel d'une proclamation.
export class ProclamationDocumentContextLoaderService {
  constructor(
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly referentielAcademiquePort?: ReferentielAcademiquePort,
    private readonly sectionClassePedagogiquePort?: SectionClassePedagogiquePort,
    private readonly titulaireDocumentPort?: ProclamationTitulaireDocumentPort,
  ) {}

  public async charger(proclamation: ProclamationClasseReadModel): Promise<ProclamationDocumentContextReadModel> {
    const classePedagogique = await this.scolariteElevesPort?.consulterClassePedagogique(
      proclamation.idClassePedagogique,
    ) ?? null;
    const idEcole = classePedagogique?.idEcole;
    const [ecole, anneeScolaire, section, titulaire] = await Promise.all([
      idEcole ? this.referentielAcademiquePort?.consulterEcole?.(idEcole) ?? Promise.resolve(null) : Promise.resolve(null),
      this.referentielAcademiquePort?.consulterAnneeScolaire?.(proclamation.idAnneeScolaire) ?? Promise.resolve(null),
      idEcole
        ? this.sectionClassePedagogiquePort?.consulterSectionClasse({
          idEcole,
          idClassePedagogique: proclamation.idClassePedagogique,
          idAnneeScolaire: proclamation.idAnneeScolaire,
        }) ?? Promise.resolve(null)
        : Promise.resolve(null),
      this.titulaireDocumentPort?.consulterTitulaireClasse({
        idClassePedagogique: proclamation.idClassePedagogique,
        idAnneeScolaire: proclamation.idAnneeScolaire,
        idEcole,
      }) ?? Promise.resolve(null),
    ]);

    return {
      meta: {
        idEcole,
        libelleAnneeScolaire: anneeScolaire?.libelle,
        libellePeriode: determinerLibellePeriode(proclamation.codeColonne, proclamation.typeProclamation),
        dateEditionDocument: formaterDateDocumentaire(new Date()),
      },
      identiteInstitutionnelle: {
        nomEcole: ecole?.nom,
        codeEcole: ecole?.code,
        sigleEcole: ecole?.sigle,
        adresseEcole: ecole?.adresse,
        telephoneEcole: ecole?.telephone,
        emailEcole: ecole?.email,
        provinceEducationnelle: ecole?.provinceEducationnelle,
        ville: ecole?.ville,
        communeOuTerritoire: ecole?.communeOuTerritoire,
      },
      contexteClasse: {
        idClassePedagogique: proclamation.idClassePedagogique,
        libelleClasse: classePedagogique?.libelleClasse,
        idSectionScolaire: section?.idSectionScolaire,
        libelleSection: section?.sectionLibelle,
        nomTitulaire: titulaire?.nomComplet,
      },
    };
  }
}
