import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { TypeStructureEvaluation } from './TypeStructureEvaluation';

// Cette interface decrit la structure complete d'une ponderation d'evaluation.
export interface ProprietesPonderationEvaluation {
  maxP1: number;
  maxP2: number;
  maxEX1: number;
  maxP3: number;
  maxP4: number;
  maxEX2: number;
  maxP5: number;
  maxP6: number;
  maxEX3: number;
}

// Cet objet valeur represente la grille officielle des maxima utilises pour les evaluations.
// Il porte toute la structure de ponderation afin d'eviter une modelisation trop pauvre autour d'un simple nombre.
export class PonderationEvaluation extends ObjetValeur<ProprietesPonderationEvaluation> {
  // Ce constructeur valide la structure complete de la ponderation avant de la figer.
  constructor(proprietes: ProprietesPonderationEvaluation) {
    super(PonderationEvaluation.validerProprietes(proprietes));
  }

  // Cette methode retourne une copie des maxima de la ponderation.
  public obtenirValeurs(): ProprietesPonderationEvaluation {
    return { ...this.proprietes };
  }

  // Cette methode valide la compatibilite de la ponderation avec une structure trimestrielle ou semestrielle.
  public verifierCompatibiliteAvecStructure(typeStructureEvaluation: TypeStructureEvaluation): void {
    if (typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL) {
      if (this.proprietes.maxP5 !== 0 || this.proprietes.maxP6 !== 0 || this.proprietes.maxEX3 !== 0) {
        throw new ValidationError(
          'Une structure semestrielle impose maxP5, maxP6 et maxEX3 a zero.',
          'PONDERATION_STRUCTURE_SEMESTRIELLE_INVALIDE',
        );
      }
    }
  }

  // Cette methode valide la compatibilite de la ponderation avec la presence ou non d'un examen.
  public verifierCompatibiliteAvecExamen(aExamen: boolean): void {
    if (!aExamen) {
      if (this.proprietes.maxEX1 !== 0 || this.proprietes.maxEX2 !== 0 || this.proprietes.maxEX3 !== 0) {
        throw new ValidationError(
          "Une ligne sans examen doit porter des maxima d'examen a zero.",
          'PONDERATION_EXAMEN_INVALIDE',
        );
      }
    }
  }

  // Cette methode controle la validite complete des maxima de ponderation.
  private static validerProprietes(
    proprietes: ProprietesPonderationEvaluation,
  ): ProprietesPonderationEvaluation {
    const proprietesValidees: ProprietesPonderationEvaluation = {
      maxP1: this.validerMaximum(proprietes.maxP1, 'maxP1'),
      maxP2: this.validerMaximum(proprietes.maxP2, 'maxP2'),
      maxEX1: this.validerMaximum(proprietes.maxEX1, 'maxEX1'),
      maxP3: this.validerMaximum(proprietes.maxP3, 'maxP3'),
      maxP4: this.validerMaximum(proprietes.maxP4, 'maxP4'),
      maxEX2: this.validerMaximum(proprietes.maxEX2, 'maxEX2'),
      maxP5: this.validerMaximum(proprietes.maxP5, 'maxP5'),
      maxP6: this.validerMaximum(proprietes.maxP6, 'maxP6'),
      maxEX3: this.validerMaximum(proprietes.maxEX3, 'maxEX3'),
    };

    const maxima = Object.values(proprietesValidees);

    if (!maxima.some((maximum) => maximum > 0)) {
      throw new ValidationError(
        'Une ponderation doit comporter au moins une composante strictement positive.',
        'PONDERATION_VIDE',
      );
    }

    return proprietesValidees;
  }

  // Cette methode valide un maximum individuel de ponderation.
  private static validerMaximum(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur)) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un entier.`,
        'PONDERATION_ENTIER_OBLIGATOIRE',
      );
    }

    if (valeur < 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" ne peut pas etre negatif.`,
        'PONDERATION_NEGATIVE',
      );
    }

    return valeur;
  }
}
