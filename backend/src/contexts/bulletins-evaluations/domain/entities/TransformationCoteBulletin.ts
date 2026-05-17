import { Entite } from '../../../../shared/domain/Entity';
import { ErreurTransformationCoteImpossible } from '../exceptions/ErreurTransformationCoteImpossible';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Cette entite garde la trace d'une transformation de cote lors d'une migration.
export class TransformationCoteBulletin extends Entite<string> {
  private idEleve: string;
  private idReferentielCours: string;
  private codeColonne: CodeColonneBulletin;
  private ancienneCote: number;
  private nouvelleCote: number;
  private ancienMaximum: number;
  private nouveauMaximum: number;
  private dateTransformation: Date;

  // Ce constructeur verifie que la transformation respecte la formule officielle.
  constructor(params: {
    idTransformationCoteBulletin: string;
    idEleve: string;
    idReferentielCours: string;
    codeColonne: CodeColonneBulletin;
    ancienneCote: number;
    nouvelleCote: number;
    ancienMaximum: number;
    nouveauMaximum: number;
    dateTransformation: Date;
  }) {
    super(params.idTransformationCoteBulletin);
    this.idEleve = params.idEleve;
    this.idReferentielCours = params.idReferentielCours;
    this.codeColonne = params.codeColonne;
    this.ancienneCote = params.ancienneCote;
    this.nouvelleCote = params.nouvelleCote;
    this.ancienMaximum = params.ancienMaximum;
    this.nouveauMaximum = params.nouveauMaximum;
    this.dateTransformation = params.dateTransformation;
    this.verifierTransformation();
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose l'identifiant du cours concerne.
  public obtenirIdReferentielCours(): string {
    return this.idReferentielCours;
  }

  // Cette methode expose la colonne transformee.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode expose l'ancienne cote.
  public obtenirAncienneCote(): number {
    return this.ancienneCote;
  }

  // Cette methode expose la nouvelle cote.
  public obtenirNouvelleCote(): number {
    return this.nouvelleCote;
  }

  // Cette methode expose l'ancien maximum.
  public obtenirAncienMaximum(): number {
    return this.ancienMaximum;
  }

  // Cette methode expose le nouveau maximum.
  public obtenirNouveauMaximum(): number {
    return this.nouveauMaximum;
  }

  // Cette methode expose la date de transformation.
  public obtenirDateTransformation(): Date {
    return this.dateTransformation;
  }

  // Cette methode protege la formule de conversion officielle.
  private verifierTransformation(): void {
    if (this.ancienMaximum <= 0 || this.nouveauMaximum <= 0) {
      throw new ErreurTransformationCoteImpossible('Les maximums de transformation doivent etre strictement positifs.');
    }

    const valeurAttendue = Math.round((this.ancienneCote / this.ancienMaximum) * this.nouveauMaximum);
    if (valeurAttendue !== this.nouvelleCote) {
      throw new ErreurTransformationCoteImpossible('La transformation ne respecte pas la formule officielle.');
    }

    if (this.nouvelleCote < 0 || this.nouvelleCote > this.nouveauMaximum) {
      throw new ErreurTransformationCoteImpossible('La nouvelle cote sort du nouveau bareme.');
    }
  }
}
