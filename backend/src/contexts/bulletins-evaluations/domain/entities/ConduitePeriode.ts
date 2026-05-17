import { Entite } from '../../../../shared/domain/Entity';
import { ErreurConduiteHorsBareme } from '../exceptions/ErreurConduiteHorsBareme';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';
import { MentionBulletin, calculerMentionBulletin } from '../value-objects/MentionBulletin';

// Cette entite represente la conduite en points sur une periode simple.
export class ConduitePeriode extends Entite<string> {
  private codePeriode: CodePeriodeSimple;
  private pointsConduite: number;
  private mentionConduite: MentionBulletin;
  private encodeePar?: string;
  private dateEncodage?: Date;

  // Ce constructeur initialise la conduite et verifie son bareme.
  constructor(params: {
    idConduitePeriode: string;
    codePeriode: CodePeriodeSimple;
    pointsConduite: number;
    mentionConduite?: MentionBulletin;
    encodeePar?: string;
    dateEncodage?: Date;
  }) {
    super(params.idConduitePeriode);
    this.codePeriode = params.codePeriode;
    this.pointsConduite = ConduitePeriode.validerPoints(params.pointsConduite);
    this.mentionConduite = params.mentionConduite ?? calculerMentionBulletin(this.pointsConduite);
    this.encodeePar = params.encodeePar;
    this.dateEncodage = params.dateEncodage;
  }

  // Cette methode expose la periode concernée.
  public obtenirCodePeriode(): CodePeriodeSimple {
    return this.codePeriode;
  }

  // Cette methode retourne les points de conduite.
  public obtenirPointsConduite(): number {
    return this.pointsConduite;
  }

  // Cette methode expose la mention de conduite.
  public obtenirMentionConduite(): MentionBulletin {
    return this.mentionConduite;
  }

  // Cette methode expose l'auteur de l'encodage.
  public obtenirEncodeePar(): string | undefined {
    return this.encodeePar;
  }

  // Cette methode expose la date d'encodage.
  public obtenirDateEncodage(): Date | undefined {
    return this.dateEncodage;
  }

  // Cette methode met a jour la conduite et sa mention.
  public encoder(pointsConduite: number, encodeePar?: string, dateEncodage = new Date()): void {
    this.pointsConduite = ConduitePeriode.validerPoints(pointsConduite);
    this.mentionConduite = calculerMentionBulletin(this.pointsConduite);
    this.encodeePar = encodeePar;
    this.dateEncodage = dateEncodage;
  }

  // Cette methode protege le bareme officiel de conduite.
  private static validerPoints(pointsConduite: number): number {
    if (!Number.isInteger(pointsConduite) || pointsConduite < 0 || pointsConduite > 100) {
      throw new ErreurConduiteHorsBareme();
    }

    return pointsConduite;
  }
}
