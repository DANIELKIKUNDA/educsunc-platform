import { Entite } from '../../../../shared/domain/Entity';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';
import { MentionBulletin, calculerMentionBulletin } from '../value-objects/MentionBulletin';
import { PourcentageBulletin } from '../value-objects/PourcentageBulletin';

// Cette entite represente l'application d'un eleve sur une periode simple.
export class ApplicationPeriode extends Entite<string> {
  private codePeriode: CodePeriodeSimple;
  private pourcentage: PourcentageBulletin;
  private mentionApplication: MentionBulletin;

  // Ce constructeur initialise l'application et calcule sa mention.
  constructor(params: {
    idApplicationPeriode: string;
    codePeriode: CodePeriodeSimple;
    pourcentage: number;
    mentionApplication?: MentionBulletin;
  }) {
    super(params.idApplicationPeriode);
    this.codePeriode = params.codePeriode;
    this.pourcentage = new PourcentageBulletin(params.pourcentage);
    this.mentionApplication = params.mentionApplication ?? calculerMentionBulletin(this.pourcentage.obtenirValeur());
  }

  // Cette methode expose la periode concernee.
  public obtenirCodePeriode(): CodePeriodeSimple {
    return this.codePeriode;
  }

  // Cette methode expose le pourcentage d'application.
  public obtenirPourcentage(): number {
    return this.pourcentage.obtenirValeur();
  }

  // Cette methode expose la mention officielle de l'application.
  public obtenirMentionApplication(): MentionBulletin {
    return this.mentionApplication;
  }

  // Cette methode recalcule application et mention depuis un nouveau pourcentage.
  public mettreAJourPourcentage(pourcentage: number): void {
    this.pourcentage = new PourcentageBulletin(pourcentage);
    this.mentionApplication = calculerMentionBulletin(this.pourcentage.obtenirValeur());
  }
}
