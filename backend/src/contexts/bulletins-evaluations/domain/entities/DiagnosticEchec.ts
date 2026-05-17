import { Entite } from '../../../../shared/domain/Entity';
import { ErreurResultatBulletinIncoherent } from '../exceptions/ErreurResultatBulletinIncoherent';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';

// Cette entite porte le diagnostic pedagogique produit a partir des echecs constates.
export class DiagnosticEchec extends Entite<string> {
  private codeColonne: CodeColonneBulletin;
  private nombreEchecs: number;
  private nombreEchecsLegers: number;
  private nombreEchecsProfonds: number;
  private eligiblePerequation: boolean;
  private eligibleRepechage: boolean;
  private commentaireTechnique?: string;

  // Ce constructeur initialise un diagnostic en verifiant la coherence des comptes.
  constructor(params: {
    idDiagnosticEchec: string;
    codeColonne: CodeColonneBulletin;
    nombreEchecs: number;
    nombreEchecsLegers: number;
    nombreEchecsProfonds: number;
    eligiblePerequation: boolean;
    eligibleRepechage: boolean;
    commentaireTechnique?: string;
  }) {
    super(params.idDiagnosticEchec);
    this.codeColonne = params.codeColonne;
    this.nombreEchecs = params.nombreEchecs;
    this.nombreEchecsLegers = params.nombreEchecsLegers;
    this.nombreEchecsProfonds = params.nombreEchecsProfonds;
    this.eligiblePerequation = params.eligiblePerequation;
    this.eligibleRepechage = params.eligibleRepechage;
    this.commentaireTechnique = params.commentaireTechnique;
    this.verifierCoherence();
  }

  // Cette methode expose la colonne analysee.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode expose le nombre total d'echecs.
  public obtenirNombreEchecs(): number {
    return this.nombreEchecs;
  }

  // Cette methode expose le nombre d'echecs legers.
  public obtenirNombreEchecsLegers(): number {
    return this.nombreEchecsLegers;
  }

  // Cette methode expose le nombre d'echecs profonds.
  public obtenirNombreEchecsProfonds(): number {
    return this.nombreEchecsProfonds;
  }

  // Cette methode indique si la perequation reste envisageable.
  public obtenirEligiblePerequation(): boolean {
    return this.eligiblePerequation;
  }

  // Cette methode indique si le repechage reste envisageable.
  public obtenirEligibleRepechage(): boolean {
    return this.eligibleRepechage;
  }

  // Cette methode expose le commentaire technique eventuel.
  public obtenirCommentaireTechnique(): string | undefined {
    return this.commentaireTechnique;
  }

  // Cette methode remplace l'analyse pedagogique.
  public mettreAJour(params: {
    nombreEchecs: number;
    nombreEchecsLegers: number;
    nombreEchecsProfonds: number;
    eligiblePerequation: boolean;
    eligibleRepechage: boolean;
    commentaireTechnique?: string;
  }): void {
    this.nombreEchecs = params.nombreEchecs;
    this.nombreEchecsLegers = params.nombreEchecsLegers;
    this.nombreEchecsProfonds = params.nombreEchecsProfonds;
    this.eligiblePerequation = params.eligiblePerequation;
    this.eligibleRepechage = params.eligibleRepechage;
    this.commentaireTechnique = params.commentaireTechnique;
    this.verifierCoherence();
  }

  // Cette methode protege la coherence interne du diagnostic.
  private verifierCoherence(): void {
    const valeurs = [this.nombreEchecs, this.nombreEchecsLegers, this.nombreEchecsProfonds];
    if (valeurs.some((valeur) => !Number.isInteger(valeur) || valeur < 0)) {
      throw new ErreurResultatBulletinIncoherent('Les nombres d echecs doivent etre des entiers naturels.');
    }

    if (this.nombreEchecsLegers + this.nombreEchecsProfonds > this.nombreEchecs) {
      throw new ErreurResultatBulletinIncoherent('Les echecs legers et profonds ne peuvent pas depasser le total.');
    }
  }
}
