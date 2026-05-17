import type { DiagnosticEchec } from '../../domain/entities/DiagnosticEchec';
import type { DiagnosticEchecOutput } from '../dto/output/DiagnosticEchecOutput';

// Ce mapper convertit un diagnostic d'echec en DTO de sortie.
export class DiagnosticMapper {
  // Cette methode produit le DTO de diagnostic pedagogique.
  public versSortie(diagnostic: DiagnosticEchec): DiagnosticEchecOutput {
    return {
      codeColonne: diagnostic.obtenirCodeColonne(),
      nombreEchecs: diagnostic.obtenirNombreEchecs(),
      nombreEchecsLegers: diagnostic.obtenirNombreEchecsLegers(),
      nombreEchecsProfonds: diagnostic.obtenirNombreEchecsProfonds(),
      eligiblePerequation: diagnostic.obtenirEligiblePerequation(),
      eligibleRepechage: diagnostic.obtenirEligibleRepechage(),
      commentaireTechnique: diagnostic.obtenirCommentaireTechnique(),
    };
  }
}
