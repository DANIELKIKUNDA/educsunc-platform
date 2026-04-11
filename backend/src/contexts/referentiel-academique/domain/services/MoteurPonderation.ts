import { TransformationNote } from '../entities/TransformationNote';
import { ErreurPonderationInvalide } from '../exceptions/ErreurPonderationInvalide';
import {
  PonderationEvaluation,
  type ProprietesPonderationEvaluation,
} from '../value-objects/PonderationEvaluation';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cette interface decrit une incoherence detectee sur une ponderation.
export interface IncoherencePonderation {
  code: string;
  message: string;
  champ?: keyof ProprietesPonderationEvaluation;
}

// Ce moteur valide et manipule les ponderations selon les regles du domaine.
export class MoteurPonderation {
  // Cette methode valide completement une ponderation dans un contexte donne.
  public validerPonderation(
    ponderation: PonderationEvaluation,
    typeStructureEvaluation: TypeStructureEvaluation,
    aExamen: boolean,
  ): void {
    const incoherences = this.detecterIncoherences(
      ponderation,
      typeStructureEvaluation,
      aExamen,
    );

    if (incoherences.length > 0) {
      throw new ErreurPonderationInvalide(
        incoherences.map((incoherence) => incoherence.message).join(' | '),
      );
    }
  }

  // Cette methode detecte toutes les incoherences connues sur une ponderation.
  public detecterIncoherences(
    ponderation: PonderationEvaluation,
    typeStructureEvaluation: TypeStructureEvaluation,
    aExamen: boolean,
  ): IncoherencePonderation[] {
    const valeurs = ponderation.obtenirValeurs();
    const incoherences: IncoherencePonderation[] = [];
    const maxima = Object.entries(valeurs) as [keyof ProprietesPonderationEvaluation, number][];

    for (const [champ, valeur] of maxima) {
      if (!Number.isInteger(valeur)) {
        incoherences.push({
          code: 'PONDERATION_NON_ENTIERE',
          message: `Le champ "${champ}" doit rester entier.`,
          champ,
        });
      }

      if (valeur < 0) {
        incoherences.push({
          code: 'PONDERATION_NEGATIVE',
          message: `Le champ "${champ}" ne peut pas etre negatif.`,
          champ,
        });
      }
    }

    if (!aExamen && (valeurs.maxEX1 !== 0 || valeurs.maxEX2 !== 0 || valeurs.maxEX3 !== 0)) {
      incoherences.push({
        code: 'PONDERATION_EXAMEN_INCOHERENTE',
        message: "Une ponderation sans examen doit garder tous les maxima d'examen a zero.",
      });
    }

    if (
      typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL
      && (valeurs.maxP5 !== 0 || valeurs.maxP6 !== 0 || valeurs.maxEX3 !== 0)
    ) {
      incoherences.push({
        code: 'PONDERATION_STRUCTURE_SEMESTRIELLE_INVALIDE',
        message: 'Une structure semestrielle impose maxP5, maxP6 et maxEX3 a zero.',
      });
    }

    if (this.calculerTotalMaxima(ponderation) <= 0) {
      incoherences.push({
        code: 'PONDERATION_VIDE',
        message: 'Une ponderation doit contenir au moins une composante strictement positive.',
      });
    }

    return incoherences;
  }

  // Cette methode calcule le total des maxima d'une ponderation.
  public calculerTotalMaxima(ponderation: PonderationEvaluation): number {
    const valeurs = ponderation.obtenirValeurs();

    return Object.values(valeurs).reduce((total, valeur) => total + valeur, 0);
  }

  // Cette methode calcule une nouvelle note selon la formule officielle verrouillee.
  public convertirValeurNote(
    ancienneValeur: number,
    ancienMaximum: number,
    nouveauMaximum: number,
  ): number {
    if (!Number.isInteger(ancienneValeur) || ancienneValeur < 0) {
      throw new ErreurPonderationInvalide(
        'La valeur de note a convertir doit etre un entier positif ou nul.',
      );
    }

    if (!Number.isInteger(ancienMaximum) || ancienMaximum <= 0) {
      throw new ErreurPonderationInvalide(
        "L'ancien maximum doit etre un entier strictement positif.",
      );
    }

    if (!Number.isInteger(nouveauMaximum) || nouveauMaximum <= 0) {
      throw new ErreurPonderationInvalide(
        'Le nouveau maximum doit etre un entier strictement positif.',
      );
    }

    if (ancienneValeur > ancienMaximum) {
      throw new ErreurPonderationInvalide(
        "La note ancienne ne peut pas depasser l'ancien maximum.",
      );
    }

    return Math.round((ancienneValeur / ancienMaximum) * nouveauMaximum);
  }

  // Cette methode prepare une transformation de note complete et traçable.
  public preparerTransformationNote(
    idNote: string,
    ancienneValeur: number,
    ancienMaximum: number,
    nouveauMaximum: number,
    dateTransformation: Date = new Date(),
  ): TransformationNote {
    return TransformationNote.creerDepuisValeurAncienne(
      idNote,
      ancienneValeur,
      ancienMaximum,
      nouveauMaximum,
      'arrondi((noteAncienne / maxAncien) * maxNouveau)',
      dateTransformation,
    );
  }
}
