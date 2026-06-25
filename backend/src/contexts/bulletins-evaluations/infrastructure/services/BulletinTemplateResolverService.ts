import type {
  BulletinFamilleDocumentaire,
  BulletinTemplateDocumentaire,
} from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';

// Ce service choisit le template documentaire le plus coherent pour un bulletin donne.
export class BulletinTemplateResolverService {
  public resoudre(
    bulletin: BulletinEleveReadModel,
    contexte?: {
      libelleClasse?: string;
      estClasseEXETAT?: boolean;
      estClasseFinaliste?: boolean;
    },
  ): {
    templateDocumentaire: BulletinTemplateDocumentaire;
    familleDocumentaire: BulletinFamilleDocumentaire;
  } {
    const estFinaliste = contexte?.estClasseFinaliste === true || contexte?.estClasseEXETAT === true;
    const estQuatriemeHumanites = estFinaliste || this.estQuatriemeHumanites(contexte?.libelleClasse);

    if (bulletin.templateDocumentaireSuggere === 'BULL-TPL-04') {
      return {
        templateDocumentaire: 'BULL-TPL-04',
        familleDocumentaire: 'SPECIAL',
      };
    }

    if (bulletin.typeStructureEvaluation === TypeStructureEvaluation.TRIMESTRIEL) {
      return {
        templateDocumentaire: 'BULL-TPL-01',
        familleDocumentaire: 'GENERAL',
      };
    }

    if (estQuatriemeHumanites && bulletin.templateDocumentaireSuggere === 'BULL-TPL-03') {
      return {
        templateDocumentaire: 'BULL-TPL-06',
        familleDocumentaire: 'DOMAINES',
      };
    }

    if (estQuatriemeHumanites) {
      return {
        templateDocumentaire: 'BULL-TPL-05',
        familleDocumentaire: 'BRANCHES',
      };
    }

    if (bulletin.templateDocumentaireSuggere === 'BULL-TPL-03') {
      return {
        templateDocumentaire: 'BULL-TPL-03',
        familleDocumentaire: 'DOMAINES',
      };
    }

    return {
      templateDocumentaire: 'BULL-TPL-02',
      familleDocumentaire: 'BRANCHES',
    };
  }

  private estQuatriemeHumanites(libelleClasse?: string): boolean {
    if (!libelleClasse) {
      return false;
    }

    const normalise = libelleClasse
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();

    return (normalise.includes('4e') || normalise.includes('4eme'))
      && normalise.includes('humanite');
  }
}
