import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import type { ProclamationDocumentDataReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';
import type { ProclamationDocumentContextLoaderService } from './ProclamationDocumentContextLoaderService';
import { ProclamationAssetsResolverService } from './ProclamationAssetsResolverService';
import { ProclamationTemplateResolverService } from './ProclamationTemplateResolverService';

// Ce service assemble la representation documentaire complete d'une proclamation.
export class ProclamationDocumentDataBuilderService {
  constructor(
    private readonly templateResolver = new ProclamationTemplateResolverService(),
    private readonly assetsResolver = new ProclamationAssetsResolverService(),
    private readonly contextLoader?: ProclamationDocumentContextLoaderService,
  ) {}

  public async construire(proclamation: ProclamationClasseReadModel): Promise<ProclamationDocumentDataReadModel> {
    const contexte = await this.contextLoader?.charger(proclamation);
    const idEcole = contexte?.meta?.idEcole;
    const assets = await this.assetsResolver.resoudre(idEcole);
    const templateDocumentaire = this.templateResolver.resoudre(proclamation);

    return {
      meta: {
        idProclamationClasse: proclamation.idProclamationClasse,
        idEcole,
        idClassePedagogique: proclamation.idClassePedagogique,
        idAnneeScolaire: proclamation.idAnneeScolaire,
        codeColonne: proclamation.codeColonne,
        typeProclamation: proclamation.typeProclamation,
        templateDocumentaire,
        dateGenerationDocument: new Date().toISOString(),
        libelleAnneeScolaire: contexte?.meta?.libelleAnneeScolaire,
        libellePeriode: contexte?.meta?.libellePeriode,
        dateEditionDocument: contexte?.meta?.dateEditionDocument,
      },
      identiteInstitutionnelle: {
        nomEcole: contexte?.identiteInstitutionnelle?.nomEcole ?? idEcole ?? 'Ecole',
        codeEcole: contexte?.identiteInstitutionnelle?.codeEcole,
        sigleEcole: contexte?.identiteInstitutionnelle?.sigleEcole,
        adresseEcole: contexte?.identiteInstitutionnelle?.adresseEcole,
        telephoneEcole: contexte?.identiteInstitutionnelle?.telephoneEcole,
        emailEcole: contexte?.identiteInstitutionnelle?.emailEcole,
        provinceEducationnelle: contexte?.identiteInstitutionnelle?.provinceEducationnelle,
        ville: contexte?.identiteInstitutionnelle?.ville,
        communeOuTerritoire: contexte?.identiteInstitutionnelle?.communeOuTerritoire,
      },
      contexteClasse: {
        idClassePedagogique: proclamation.idClassePedagogique,
        libelleClasse: contexte?.contexteClasse?.libelleClasse,
        idSectionScolaire: contexte?.contexteClasse?.idSectionScolaire,
        libelleSection: contexte?.contexteClasse?.libelleSection,
        nomTitulaire: contexte?.contexteClasse?.nomTitulaire,
      },
      structure: {
        lignesClassees: proclamation.lignes,
        nonClasses: proclamation.nonClasses,
        abandons: proclamation.abandons,
        statistiques: proclamation.statistiques,
      },
      assets,
    };
  }
}
