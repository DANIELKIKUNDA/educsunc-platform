import { VersionReferentielProgramme } from '../aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../entities/LigneReferentielProgramme';
import { ErreurLigneDupliquee } from '../exceptions/ErreurLigneDupliquee';
import { ErreurPonderationInvalide } from '../exceptions/ErreurPonderationInvalide';
import { ErreurProgrammeInvalide } from '../exceptions/ErreurProgrammeInvalide';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Ce rapport expose la synthese d'une validation de programme officiel.
export interface RapportProgrammeAcademique {
  nombreLignes: number;
  nombreCoursUniques: number;
  ordreMaximum: number;
  structureEvaluation: TypeStructureEvaluation;
}

// Ce moteur gere la coherence des programmes officiels et de leurs lignes.
export class MoteurProgrammeAcademique {
  // Cette methode valide un programme officiel complet et retourne une synthese exploitable.
  public validerProgrammeOfficiel(
    versionReferentielProgramme: VersionReferentielProgramme,
    typeStructureEvaluation: TypeStructureEvaluation,
  ): RapportProgrammeAcademique {
    const lignes = versionReferentielProgramme.obtenirLignes();

    this.verifierLignesProgramme(lignes, typeStructureEvaluation);

    return {
      nombreLignes: lignes.length,
      nombreCoursUniques: new Set(lignes.map((ligne) => this.extraireCleCours(ligne))).size,
      ordreMaximum: this.calculerOrdreMaximum(lignes),
      structureEvaluation: typeStructureEvaluation,
    };
  }

  // Cette methode verifie l'ensemble des lignes d'un programme officiel.
  public verifierLignesProgramme(
    lignes: readonly LigneReferentielProgramme[],
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    if (lignes.length === 0) {
      throw new ErreurProgrammeInvalide(
        'Un programme officiel doit contenir au moins une ligne de cours.',
      );
    }

    this.validerUniciteDesCours(lignes);
    this.validerOrdreDesCours(lignes);
    this.validerCoherencePonderations(lignes, typeStructureEvaluation);
  }

  // Cette methode valide qu'un cours n'apparait qu'une seule fois dans le programme officiel.
  public validerUniciteDesCours(lignes: readonly LigneReferentielProgramme[]): void {
    const coursRencontres = new Set<string>();

    for (const ligne of lignes) {
      const cleCours = this.extraireCleCours(ligne);

      if (coursRencontres.has(cleCours)) {
        throw new ErreurLigneDupliquee(
          'Un cours officiel ne peut apparaitre qu une seule fois dans un programme.',
        );
      }

      coursRencontres.add(cleCours);
    }
  }

  // Cette methode valide que l'ordre pedagogique des lignes reste strict et croissant.
  public validerOrdreDesCours(lignes: readonly LigneReferentielProgramme[]): void {
    const ordres = lignes
      .map((ligne) => ligne.obtenirOrdreAffichage())
      .sort((premier, second) => premier - second);

    for (let index = 1; index < ordres.length; index += 1) {
      if (ordres[index] <= ordres[index - 1]) {
        throw new ErreurProgrammeInvalide(
          "L'ordre des cours d'un programme officiel doit rester strictement croissant.",
        );
      }
    }
  }

  // Cette methode valide la coherence des ponderations avec la structure d'evaluation.
  public validerCoherencePonderations(
    lignes: readonly LigneReferentielProgramme[],
    typeStructureEvaluation: TypeStructureEvaluation,
  ): void {
    for (const ligne of lignes) {
      try {
        ligne.verifierCompatibiliteAvecStructure(typeStructureEvaluation);
      } catch (erreur) {
        const message = erreur instanceof Error
          ? erreur.message
          : 'La ponderation de ligne est incoherente avec la structure d evaluation.';

        throw new ErreurPonderationInvalide(message);
      }
    }
  }

  // Cette methode calcule l'ordre maximum rencontre dans une liste de lignes officielles.
  public calculerOrdreMaximum(lignes: readonly LigneReferentielProgramme[]): number {
    if (lignes.length === 0) {
      return 0;
    }

    return Math.max(...lignes.map((ligne) => ligne.obtenirOrdreAffichage()));
  }

  private extraireCleCours(ligne: LigneReferentielProgramme): string {
    return ligne.obtenirReferentielCoursId().obtenirValeur().toUpperCase();
  }
}
