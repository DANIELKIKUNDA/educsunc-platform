import { Entite } from '../../../../shared/domain/Entity';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';
import { MentionBulletin } from '../value-objects/MentionBulletin';

// Cette entite regroupe application et conduite sur une meme periode du bulletin.
export class BlocApplicationConduite extends Entite<string> {
  private codePeriode: CodePeriodeSimple;
  private application?: MentionBulletin;
  private conduite?: MentionBulletin;
  private pointsConduite?: number;

  // Ce constructeur initialise le bloc d'affichage application/conduite.
  constructor(params: {
    idBlocApplicationConduite: string;
    codePeriode: CodePeriodeSimple;
    application?: MentionBulletin;
    conduite?: MentionBulletin;
    pointsConduite?: number;
  }) {
    super(params.idBlocApplicationConduite);
    this.codePeriode = params.codePeriode;
    this.application = params.application;
    this.conduite = params.conduite;
    this.pointsConduite = params.pointsConduite;
  }

  // Cette methode expose la periode concernee.
  public obtenirCodePeriode(): CodePeriodeSimple {
    return this.codePeriode;
  }

  // Cette methode expose l'application affichee en sigle.
  public obtenirApplication(): MentionBulletin | undefined {
    return this.application;
  }

  // Cette methode expose la conduite affichee en sigle.
  public obtenirConduite(): MentionBulletin | undefined {
    return this.conduite;
  }

  // Cette methode expose les points de conduite conserves en interne.
  public obtenirPointsConduite(): number | undefined {
    return this.pointsConduite;
  }
}
