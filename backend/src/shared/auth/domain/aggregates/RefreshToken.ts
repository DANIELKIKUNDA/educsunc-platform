import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { RefreshTokenCree } from '../events/RefreshTokenCree';
import { RefreshTokenRevoque } from '../events/RefreshTokenRevoque';
import { ErreurRefreshTokenRevoque } from '../exceptions/ErreurRefreshTokenRevoque';

export interface ProprietesRefreshToken {
  idRefreshToken: string;
  idUtilisateur: string;
  idSessionUtilisateur?: string;
  remplaceParId?: string;
  tokenHash: string;
  tokenVersionEmise: number;
  revoque: boolean;
  revoqueLe?: Date;
  creeLe: Date;
  version: number;
}

// Cet agregat represente un refresh token persistant et rotatif.
export class RefreshToken extends RacineAgregat<string> {
  private idUtilisateur: string;
  private idSessionUtilisateur?: string;
  private remplaceParId?: string;
  private tokenHash: string;
  private tokenVersionEmise: number;
  private revoque: boolean;
  private revoqueLe?: Date;
  private creeLe: Date;
  private version: number;

  constructor(proprietes: ProprietesRefreshToken) {
    super(RefreshToken.validerTexte(proprietes.idRefreshToken, 'idRefreshToken'));
    this.idUtilisateur = RefreshToken.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.idSessionUtilisateur = RefreshToken.nettoyerOptionnel(proprietes.idSessionUtilisateur);
    this.remplaceParId = RefreshToken.nettoyerOptionnel(proprietes.remplaceParId);
    this.tokenHash = RefreshToken.validerTexte(proprietes.tokenHash, 'tokenHash');
    this.tokenVersionEmise = RefreshToken.validerVersionSecurite(proprietes.tokenVersionEmise);
    this.revoque = Boolean(proprietes.revoque);
    this.revoqueLe = RefreshToken.clonerDateOptionnelle(proprietes.revoqueLe);
    this.creeLe = RefreshToken.validerDate(proprietes.creeLe, 'creeLe');
    this.version = RefreshToken.validerVersion(proprietes.version);
  }

  // Cette methode cree un refresh token persistant a partir d'un hash technique.
  public static creer(params: {
    idUtilisateur: string;
    tokenHash: string;
    tokenVersionEmise: number;
    idSessionUtilisateur?: string;
  }): RefreshToken {
    const refreshToken = new RefreshToken({
      idRefreshToken: randomUUID(),
      idUtilisateur: params.idUtilisateur,
      idSessionUtilisateur: params.idSessionUtilisateur,
      tokenHash: params.tokenHash,
      tokenVersionEmise: params.tokenVersionEmise,
      revoque: false,
      creeLe: new Date(),
      version: 1,
    });
    refreshToken.ajouterEvenement(new RefreshTokenCree(refreshToken.obtenirId(), refreshToken.idUtilisateur));
    return refreshToken;
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirIdSessionUtilisateur(): string | undefined { return this.idSessionUtilisateur; }
  public obtenirRemplaceParId(): string | undefined { return this.remplaceParId; }
  public obtenirTokenHash(): string { return this.tokenHash; }
  public obtenirTokenVersionEmise(): number { return this.tokenVersionEmise; }
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

  public associerSession(idSessionUtilisateur: string): void {
    const id = RefreshToken.validerTexte(idSessionUtilisateur, 'idSessionUtilisateur');
    if (this.idSessionUtilisateur && this.idSessionUtilisateur !== id) {
      throw new Error('Le refresh token appartient deja a une autre session.');
    }
    if (!this.idSessionUtilisateur) {
      this.idSessionUtilisateur = id;
      this.version += 1;
    }
  }

  public marquerRemplacement(idNouveauRefreshToken: string): void {
    this.remplaceParId = RefreshToken.validerTexte(idNouveauRefreshToken, 'idNouveauRefreshToken');
    this.revoquer();
  }

  // Cette methode verifie que le refresh token n'a pas ete revoque.
  public verifierValidite(): void {
    if (this.revoque) {
      throw new ErreurRefreshTokenRevoque();
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

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre || undefined;
  }

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version du refresh token doit etre un entier strictement positif.');
    }
    return valeur;
  }

  private static validerVersionSecurite(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version de securite du refresh token doit etre un entier strictement positif.');
    }
    return valeur;
  }
}
