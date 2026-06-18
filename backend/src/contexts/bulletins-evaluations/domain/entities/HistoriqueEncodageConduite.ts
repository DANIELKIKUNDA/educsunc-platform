import { Entite } from '../../../../shared/domain/Entity';
import { ErreurConduiteHorsBareme } from '../exceptions/ErreurConduiteHorsBareme';
import { CodePeriodeSimple } from '../value-objects/CodePeriodeSimple';
import type { MentionBulletin } from '../value-objects/MentionBulletin';

// Cette entite fige une mutation de conduite de maniere immutable et auditable.
export class HistoriqueEncodageConduite extends Entite<string> {
  private idResultatBulletinEleve: string;
  private idEleve: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private codePeriode: CodePeriodeSimple;
  private anciensPointsConduite: number | null;
  private nouveauxPointsConduite: number;
  private ancienneMentionConduite?: MentionBulletin;
  private nouvelleMentionConduite: MentionBulletin;
  private encodeePar: string;
  private dateEncodage: Date;

  constructor(params: {
    idHistoriqueEncodageConduite: string;
    idResultatBulletinEleve: string;
    idEleve: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    codePeriode: CodePeriodeSimple;
    anciensPointsConduite: number | null;
    nouveauxPointsConduite: number;
    ancienneMentionConduite?: MentionBulletin;
    nouvelleMentionConduite: MentionBulletin;
    encodeePar: string;
    dateEncodage: Date;
  }) {
    super(params.idHistoriqueEncodageConduite);
    this.idResultatBulletinEleve = params.idResultatBulletinEleve;
    this.idEleve = params.idEleve;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codePeriode = params.codePeriode;
    this.anciensPointsConduite = this.validerPointsOuNull(params.anciensPointsConduite);
    this.nouveauxPointsConduite = this.validerPoints(params.nouveauxPointsConduite);
    this.ancienneMentionConduite = params.ancienneMentionConduite;
    this.nouvelleMentionConduite = params.nouvelleMentionConduite;
    this.encodeePar = params.encodeePar;
    this.dateEncodage = new Date(params.dateEncodage.getTime());
  }

  public obtenirIdResultatBulletinEleve(): string { return this.idResultatBulletinEleve; }
  public obtenirIdEleve(): string { return this.idEleve; }
  public obtenirIdClassePedagogique(): string { return this.idClassePedagogique; }
  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirCodePeriode(): CodePeriodeSimple { return this.codePeriode; }
  public obtenirAnciensPointsConduite(): number | null { return this.anciensPointsConduite; }
  public obtenirNouveauxPointsConduite(): number { return this.nouveauxPointsConduite; }
  public obtenirAncienneMentionConduite(): MentionBulletin | undefined { return this.ancienneMentionConduite; }
  public obtenirNouvelleMentionConduite(): MentionBulletin { return this.nouvelleMentionConduite; }
  public obtenirEncodeePar(): string { return this.encodeePar; }
  public obtenirDateEncodage(): Date { return new Date(this.dateEncodage.getTime()); }

  private validerPoints(pointsConduite: number): number {
    if (!Number.isInteger(pointsConduite) || pointsConduite < 0 || pointsConduite > 100) {
      throw new ErreurConduiteHorsBareme();
    }

    return pointsConduite;
  }

  private validerPointsOuNull(pointsConduite: number | null): number | null {
    return pointsConduite === null ? null : this.validerPoints(pointsConduite);
  }
}
