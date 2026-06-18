import { CriteresAnalysePedagogique } from '../entities/CriteresAnalysePedagogique';
import { DiagnosticEchec } from '../entities/DiagnosticEchec';
import { CoteColonneBulletin } from '../entities/CoteColonneBulletin';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Ce moteur derive un diagnostic pedagogique a partir des echecs observes.
export class MoteurDiagnosticPedagogique {
  // Cette methode produit un diagnostic simple a partir d'une liste de cotes.
  public calculer(
    idDiagnosticEchec: string,
    codeColonne: CodeColonneBulletin,
    cotes: CoteColonneBulletin[],
    criteres = CriteresAnalysePedagogique.parDefaut(),
  ): DiagnosticEchec {
    const cotesEnEchec = cotes.filter((cote) => this.estEchecSelonCriteres(cote, criteres));
    const nombreEchecs = cotesEnEchec.length;
    const nombreEchecsProfonds = cotesEnEchec.filter(
      (cote) => this.estEchecProfondSelonCriteres(cote, criteres),
    ).length;
    const nombreEchecsLegers = nombreEchecs - nombreEchecsProfonds;

    return new DiagnosticEchec({
      idDiagnosticEchec,
      codeColonne,
      nombreEchecs,
      nombreEchecsLegers,
      nombreEchecsProfonds,
      eligiblePerequation: nombreEchecsLegers <= criteres.obtenirSeuilPerequation(),
      eligibleRepechage: nombreEchecs <= criteres.obtenirSeuilRepechage(),
      commentaireTechnique: nombreEchecs === 0 ? 'Aucun echec detecte.' : 'Diagnostic derive automatiquement des cotes en echec.',
    });
  }

  private estEchecSelonCriteres(cote: CoteColonneBulletin, criteres: CriteresAnalysePedagogique): boolean {
    const coteObtenue = cote.obtenirCoteObtenue();
    const maximum = cote.obtenirMaximumColonne();

    if (coteObtenue === null || maximum <= 0) {
      return false;
    }

    return ((coteObtenue / maximum) * 100) < criteres.obtenirSeuilEchec();
  }

  private estEchecProfondSelonCriteres(cote: CoteColonneBulletin, criteres: CriteresAnalysePedagogique): boolean {
    const coteObtenue = cote.obtenirCoteObtenue();
    const maximum = cote.obtenirMaximumColonne();

    if (coteObtenue === null || maximum <= 0) {
      return false;
    }

    return ((coteObtenue / maximum) * 100) < criteres.obtenirSeuilEchecProfond();
  }
}
