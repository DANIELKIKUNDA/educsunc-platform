import { DiagnosticEchec } from '../entities/DiagnosticEchec';
import { CoteColonneBulletin } from '../entities/CoteColonneBulletin';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Ce moteur derive un diagnostic pedagogique a partir des echecs observes.
export class MoteurDiagnosticPedagogique {
  // Cette methode produit un diagnostic simple a partir d'une liste de cotes.
  public calculer(idDiagnosticEchec: string, codeColonne: CodeColonneBulletin, cotes: CoteColonneBulletin[]): DiagnosticEchec {
    const cotesEnEchec = cotes.filter((cote) => cote.obtenirEstEchec());
    const nombreEchecs = cotesEnEchec.length;
    const nombreEchecsProfonds = cotesEnEchec.filter(
      (cote) => (cote.obtenirCoteObtenue() ?? 0) < (cote.obtenirMaximumColonne() / 4),
    ).length;
    const nombreEchecsLegers = nombreEchecs - nombreEchecsProfonds;

    return new DiagnosticEchec({
      idDiagnosticEchec,
      codeColonne,
      nombreEchecs,
      nombreEchecsLegers,
      nombreEchecsProfonds,
      eligiblePerequation: nombreEchecsLegers <= 2,
      eligibleRepechage: nombreEchecs <= 2,
      commentaireTechnique: nombreEchecs === 0 ? 'Aucun echec detecte.' : 'Diagnostic derive automatiquement des cotes en echec.',
    });
  }
}
