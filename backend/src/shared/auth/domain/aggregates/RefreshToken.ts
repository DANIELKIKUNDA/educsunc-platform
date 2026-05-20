import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { RefreshTokenCree } from '../events/RefreshTokenCree';
import { RefreshTokenExpire } from '../events/RefreshTokenExpire';
import { RefreshTokenRevoque } from '../events/RefreshTokenRevoque';
import { ErreurRefreshTokenExpire } from '../exceptions/ErreurRefreshTokenExpire';
import { ErreurRefreshTokenRevoque } from '../exceptions/ErreurRefreshTokenRevoque';

export interface ProprietesRefreshToken {
  idRefreshToken: string;
  idUtilisateur: string;
  tokenHash: string;
  expireLe: Date;
  revoque: boolean;
  revoqueLe?: Date;
  creeLe: Date;
  version: number;
}

// Cet agregat represente un refresh token persistant et rotatif.
export class RefreshToken extends RacineAgregat<string> {
  private idUtilisateur: string;
  private tokenHash: string;
  private expireLe: Date;
  private revoque: boolean;
  private revoqueLe?: Date;
  private creeLe: Date;
  private version: number;

  constructor(proprietes: ProprietesRefreshToken) {
    super(RefreshToken.validerTexte(proprietes.idRefreshToken, 'idRefreshToken'));
    this.idUtilisateur = RefreshToken.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.tokenHash = RefreshToken.validerTexte(proprietes.tokenHash, 'tokenHash');
    this.expireLe = RefreshToken.validerDate(proprietes.expireLe, 'expireLe');
    this.revoque = Boolean(proprietes.revoque);
    this.revoqueLe = RefreshToken.clonerDateOptionnelle(proprietes.revoqueLe);
    this.creeLe = RefreshToken.validerDate(proprietes.creeLe, 'creeLe');
    this.version = RefreshToken.validerVersion(proprietes.version);
  }

  // Cette methode cree un refresh token persistant a partir d'un hash technique.
  public static creer(params: {
    idUtilisateur: string;
    tokenHash: string;
    expireLe: Date;
  }): RefreshToken {
    const refreshToken = new RefreshToken({
      idRefreshToken: randomUUID(),
      idUtilisateur: params.idUtilisateur,
      tokenHash: params.tokenHash,
      expireLe: params.expireLe,
      revoque: false,
      creeLe: new Date(),
      version: 1,
    });
    refreshToken.ajouterEvenement(new RefreshTokenCree(refreshToken.obtenirId(), refreshToken.idUtilisateur));
    return refreshToken;
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirTokenHash(): string { return this.tokenHash; }
  public obtenirExpireLe(): Date { return new Date(this.expireLe.getTime()); }
  public obtenirRevoque(): boolean { return this.revoque; }
  public obtenirRevoqueLe(): Date | undefined { return RefreshToken.clonerDateOptionnelle(this.revoqueLe); }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirVersion(): number { return this.version; }

  // Cette methode revoque explicitement le refresh token courant.
  public revoquer(): void {
    if (this.revoque) {
      return;
    }

    this.revoque = true;
    this.revoqueLe = new Date();
    this.version += 1;
    this.ajouterEvenement(new RefreshTokenRevoque(this.obtenirId(), this.idUtilisateur));
  }

  // Cette methode verifie qu'un refresh token n'est ni revoque ni expire.
  public verifierExpiration(maintenant = new Date()): void {
    if (this.revoque) {
      throw new ErreurRefreshTokenRevoque();
    }

    if (this.expireLe.getTime() <= maintenant.getTime()) {
      this.ajouterEvenement(new RefreshTokenExpire(this.obtenirId(), this.idUtilisateur));
      throw new ErreurRefreshTokenExpire();
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${nomChamp} est invalide.`);
    }
    return new Date(valeur.getTime());
  }

  private static clonerDateOptionnelle(valeur?: Date): Date | undefined {
    return valeur ? new Date(valeur.getTime()) : undefined;
  }

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version du refresh token doit etre un entier strictement positif.');
    }
    return valeur;
  }
}
