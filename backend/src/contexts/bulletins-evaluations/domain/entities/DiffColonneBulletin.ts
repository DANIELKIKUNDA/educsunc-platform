import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { TypeDiffBulletin } from '../value-objects/TypeDiffBulletin';

// Cette classe represente une difference detectee entre deux versions de referentiel.
export class DiffColonneBulletin {
  private typeDiff: TypeDiffBulletin;
  private codeCours: string;
  private codeColonne?: CodeColonneBulletin;
  private ancienMaximum?: number;
  private nouveauMaximum?: number;
  private ancienOrdre?: number;
  private nouvelOrdre?: number;
  private commentaire?: string;

  // Ce constructeur initialise la difference historisee par la migration.
  constructor(params: {
    typeDiff: TypeDiffBulletin;
    codeCours: string;
    codeColonne?: CodeColonneBulletin;
    ancienMaximum?: number;
    nouveauMaximum?: number;
    ancienOrdre?: number;
    nouvelOrdre?: number;
    commentaire?: string;
  }) {
    this.typeDiff = params.typeDiff;
    this.codeCours = params.codeCours;
    this.codeColonne = params.codeColonne;
    this.ancienMaximum = params.ancienMaximum;
    this.nouveauMaximum = params.nouveauMaximum;
    this.ancienOrdre = params.ancienOrdre;
    this.nouvelOrdre = params.nouvelOrdre;
    this.commentaire = params.commentaire;
  }

  // Cette methode expose le type de difference.
  public obtenirTypeDiff(): TypeDiffBulletin {
    return this.typeDiff;
  }

  // Cette methode expose le code du cours concerne.
  public obtenirCodeCours(): string {
    return this.codeCours;
  }

  // Cette methode expose la colonne concernee si la difference la vise.
  public obtenirCodeColonne(): CodeColonneBulletin | undefined {
    return this.codeColonne;
  }

  // Cette methode expose l'ancien maximum si la difference en comporte un.
  public obtenirAncienMaximum(): number | undefined {
    return this.ancienMaximum;
  }

  // Cette methode expose le nouveau maximum si la difference en comporte un.
  public obtenirNouveauMaximum(): number | undefined {
    return this.nouveauMaximum;
  }

  // Cette methode expose l'ancien ordre de cours si disponible.
  public obtenirAncienOrdre(): number | undefined {
    return this.ancienOrdre;
  }

  // Cette methode expose le nouvel ordre de cours si disponible.
  public obtenirNouvelOrdre(): number | undefined {
    return this.nouvelOrdre;
  }

  // Cette methode expose le commentaire libre si present.
  public obtenirCommentaire(): string | undefined {
    return this.commentaire;
  }
}
