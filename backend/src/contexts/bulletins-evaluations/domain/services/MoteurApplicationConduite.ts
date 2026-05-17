import { ResultatBulletinEleve } from '../aggregates/ResultatBulletinEleve';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';

// Ce moteur centralise application et conduite sur les periodes simples.
export class MoteurApplicationConduite {
  // Cette methode calcule puis pousse l'application dans le resultat consolide.
  public calculerApplication(resultat: ResultatBulletinEleve, codePeriode: CodePeriodeSimple, pourcentage: number): void {
    resultat.mettreAJourApplication(codePeriode, pourcentage);
  }

  // Cette methode enregistre la conduite sur une periode simple.
  public encoderConduite(
    resultat: ResultatBulletinEleve,
    codePeriode: CodePeriodeSimple,
    pointsConduite: number,
    encodeePar?: string,
  ): void {
    resultat.mettreAJourConduite(codePeriode, pointsConduite, encodeePar);
  }
}
