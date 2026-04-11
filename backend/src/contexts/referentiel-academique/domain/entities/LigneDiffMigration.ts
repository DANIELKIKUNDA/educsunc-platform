import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { PonderationEvaluation } from '../value-objects/PonderationEvaluation';
import { TypeDiffReferentiel } from '../value-objects/TypeDiffReferentiel';

// Cette entite interne represente une difference detectee entre deux versions de referentiel.
export class LigneDiffMigration {
  private typeDiff: TypeDiffReferentiel;
  private codeCours: string;
  private anciennePonderation?: PonderationEvaluation;
  private nouvellePonderation?: PonderationEvaluation;
  private ancienOrdre?: number;
  private nouvelOrdre?: number;
  private commentaire?: string;

  // Ce constructeur initialise une ligne de difference et en valide la coherence.
  constructor(
    typeDiff: TypeDiffReferentiel,
    codeCours: string,
    anciennePonderation?: PonderationEvaluation,
    nouvellePonderation?: PonderationEvaluation,
    ancienOrdre?: number,
    nouvelOrdre?: number,
    commentaire?: string,
  ) {
    this.typeDiff = this.validerTypeDiff(typeDiff);
    this.codeCours = this.validerCodeCours(codeCours);
    this.anciennePonderation = this.validerPonderationOptionnelle(anciennePonderation);
    this.nouvellePonderation = this.validerPonderationOptionnelle(nouvellePonderation);
    this.ancienOrdre = this.validerOrdreOptionnel(ancienOrdre, 'ancienOrdre');
    this.nouvelOrdre = this.validerOrdreOptionnel(nouvelOrdre, 'nouvelOrdre');
    this.commentaire = this.validerCommentaire(commentaire);
    this.validerCoherenceParType();
  }

  // Cette methode retourne le type de difference detectee.
  public obtenirTypeDiff(): TypeDiffReferentiel {
    return this.typeDiff;
  }

  // Cette methode retourne le code du cours concerne.
  public obtenirCodeCours(): string {
    return this.codeCours;
  }

  // Cette methode retourne l'ancienne ponderation si elle existe.
  public obtenirAnciennePonderation(): PonderationEvaluation | undefined {
    return this.anciennePonderation;
  }

  // Cette methode retourne la nouvelle ponderation si elle existe.
  public obtenirNouvellePonderation(): PonderationEvaluation | undefined {
    return this.nouvellePonderation;
  }

  // Cette methode retourne l'ancien ordre si il existe.
  public obtenirAncienOrdre(): number | undefined {
    return this.ancienOrdre;
  }

  // Cette methode retourne le nouvel ordre si il existe.
  public obtenirNouvelOrdre(): number | undefined {
    return this.nouvelOrdre;
  }

  // Cette methode retourne le commentaire associe a la difference.
  public obtenirCommentaire(): string | undefined {
    return this.commentaire;
  }

  // Cette methode valide le type de difference.
  private validerTypeDiff(valeur: TypeDiffReferentiel): TypeDiffReferentiel {
    if (!Object.values(TypeDiffReferentiel).includes(valeur)) {
      throw new ValidationError(
        'Le type de difference doit etre valide.',
        'LIGNE_DIFF_MIGRATION_TYPE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide le code du cours concerne.
  private validerCodeCours(valeur: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        'Le code du cours concerne est obligatoire.',
        'LIGNE_DIFF_MIGRATION_CODE_COURS_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  // Cette methode valide une ponderation optionnelle.
  private validerPonderationOptionnelle(
    valeur?: PonderationEvaluation,
  ): PonderationEvaluation | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!(valeur instanceof PonderationEvaluation)) {
      throw new ValidationError(
        'La ponderation de difference doit etre valide.',
        'LIGNE_DIFF_MIGRATION_PONDERATION_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide un ordre optionnel.
  private validerOrdreOptionnel(valeur: number | undefined, nomChamp: string): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
        'LIGNE_DIFF_MIGRATION_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide le commentaire optionnel.
  private validerCommentaire(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  // Cette methode impose la coherence minimale selon le type de difference.
  private validerCoherenceParType(): void {
    if (
      this.typeDiff === TypeDiffReferentiel.PONDERATION_MODIFIEE
      && (this.anciennePonderation === undefined || this.nouvellePonderation === undefined)
    ) {
      throw new ValidationError(
        'Une difference de ponderation doit fournir les deux ponderations.',
        'LIGNE_DIFF_MIGRATION_PONDERATION_OBLIGATOIRE',
      );
    }

    if (
      this.typeDiff === TypeDiffReferentiel.ORDRE_MODIFIE
      && (this.ancienOrdre === undefined || this.nouvelOrdre === undefined)
    ) {
      throw new ValidationError(
        "Une difference d'ordre doit fournir les deux ordres.",
        'LIGNE_DIFF_MIGRATION_ORDRE_OBLIGATOIRE',
      );
    }
  }
}
