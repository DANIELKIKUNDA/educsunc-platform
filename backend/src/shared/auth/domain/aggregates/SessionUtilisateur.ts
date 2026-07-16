import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { EcoleActiveChangee } from '../events/EcoleActiveChangee';
import { OrganisationActiveChangee } from '../events/OrganisationActiveChangee';
import { SessionOfflineActivee } from '../events/SessionOfflineActivee';
import { SessionOuverte } from '../events/SessionOuverte';
import { SessionRevoquee } from '../events/SessionRevoquee';
import { PolicyContexteActif } from '../policies/PolicyContexteActif';
import { PolicySessionPersistante } from '../policies/PolicySessionPersistante';

export interface ProprietesSessionUtilisateur {
  idSessionUtilisateur: string;
  idUtilisateur: string;
  refreshTokenId: string;
  adresseIp?: string;
  userAgent?: string;
  deviceId?: string;
  estOffline: boolean;
  revoqueeLe?: Date;
  raisonRevocation?: string;
  dernierRefreshLe?: Date;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  creeLe: Date;
  version: number;
}

// Cet agregat porte l'etat persistant d'une session utilisateur AUTH.
export class SessionUtilisateur extends RacineAgregat<string> {
  private idUtilisateur: string;
  private refreshTokenId: string;
  private adresseIp?: string;
  private userAgent?: string;
  private deviceId?: string;
  private estOffline: boolean;
  private revoqueeLe?: Date;
  private raisonRevocation?: string;
  private dernierRefreshLe?: Date;
  private organisationActiveId?: string;
  private ecoleActiveId?: string;
  private creeLe: Date;
  private version: number;

  constructor(proprietes: ProprietesSessionUtilisateur) {
    super(SessionUtilisateur.validerTexte(proprietes.idSessionUtilisateur, 'idSessionUtilisateur'));
    this.idUtilisateur = SessionUtilisateur.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.refreshTokenId = SessionUtilisateur.validerTexte(proprietes.refreshTokenId, 'refreshTokenId');
    this.adresseIp = SessionUtilisateur.nettoyerOptionnel(proprietes.adresseIp);
    this.userAgent = SessionUtilisateur.nettoyerOptionnel(proprietes.userAgent);
    this.deviceId = SessionUtilisateur.nettoyerOptionnel(proprietes.deviceId);
    this.estOffline = Boolean(proprietes.estOffline);
    this.revoqueeLe = SessionUtilisateur.clonerDateOptionnelle(proprietes.revoqueeLe);
    this.raisonRevocation = SessionUtilisateur.nettoyerOptionnel(proprietes.raisonRevocation);
    this.dernierRefreshLe = SessionUtilisateur.clonerDateOptionnelle(proprietes.dernierRefreshLe);
    this.organisationActiveId = SessionUtilisateur.nettoyerOptionnel(proprietes.organisationActiveId);
    this.ecoleActiveId = SessionUtilisateur.nettoyerOptionnel(proprietes.ecoleActiveId);
    this.creeLe = SessionUtilisateur.validerDate(proprietes.creeLe, 'creeLe');
    this.version = SessionUtilisateur.validerVersion(proprietes.version);
    PolicyContexteActif.verifier({
      organisationActiveId: this.organisationActiveId,
      ecoleActiveId: this.ecoleActiveId,
    });
  }

  // Cette methode ouvre une nouvelle session persistante pour un utilisateur.
  public static ouvrir(params: {
    idUtilisateur: string;
    refreshTokenId: string;
    adresseIp?: string;
    userAgent?: string;
    deviceId?: string;
    estOffline?: boolean;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): SessionUtilisateur {
    const session = new SessionUtilisateur({
      idSessionUtilisateur: randomUUID(),
      idUtilisateur: params.idUtilisateur,
      refreshTokenId: params.refreshTokenId,
      adresseIp: params.adresseIp,
      userAgent: params.userAgent,
      deviceId: params.deviceId,
      estOffline: params.estOffline ?? false,
      organisationActiveId: params.organisationActiveId,
      ecoleActiveId: params.ecoleActiveId,
      creeLe: new Date(),
      version: 1,
    });
    session.ajouterEvenement(new SessionOuverte(session.obtenirId(), session.idUtilisateur));
    return session;
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirRefreshTokenId(): string { return this.refreshTokenId; }
  public obtenirAdresseIp(): string | undefined { return this.adresseIp; }
  public obtenirUserAgent(): string | undefined { return this.userAgent; }
  public obtenirDeviceId(): string | undefined { return this.deviceId; }
  public obtenirEstOffline(): boolean { return this.estOffline; }
  public obtenirRevoqueeLe(): Date | undefined { return SessionUtilisateur.clonerDateOptionnelle(this.revoqueeLe); }
  public obtenirRaisonRevocation(): string | undefined { return this.raisonRevocation; }
  public obtenirDernierRefreshLe(): Date | undefined { return SessionUtilisateur.clonerDateOptionnelle(this.dernierRefreshLe); }
  public obtenirOrganisationActiveId(): string | undefined { return this.organisationActiveId; }
  public obtenirEcoleActiveId(): string | undefined { return this.ecoleActiveId; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirVersion(): number { return this.version; }

  // Cette methode revoque definitivement la session courante.
  public revoquer(raisonRevocation = 'logout'): void {
    if (this.revoqueeLe) {
      return;
    }

    this.revoqueeLe = new Date();
    this.raisonRevocation = SessionUtilisateur.validerTexte(raisonRevocation, 'raisonRevocation');
    this.version += 1;
    this.ajouterEvenement(new SessionRevoquee(this.obtenirId(), this.idUtilisateur, this.raisonRevocation));
  }

  // Cette methode change l'organisation active de la session.
  public changerOrganisationActive(organisationActiveId?: string): void {
    this.organisationActiveId = SessionUtilisateur.nettoyerOptionnel(organisationActiveId);
    if (!this.organisationActiveId) {
      this.ecoleActiveId = undefined;
    }
    PolicyContexteActif.verifier({
      organisationActiveId: this.organisationActiveId,
      ecoleActiveId: this.ecoleActiveId,
    });
    this.version += 1;
    this.ajouterEvenement(new OrganisationActiveChangee(this.obtenirId(), this.organisationActiveId));
  }

  // Cette methode change l'ecole active de la session si le contexte est coherent.
  public changerEcoleActive(ecoleActiveId?: string, ecoleAppartientOrganisation = true): void {
    this.ecoleActiveId = SessionUtilisateur.nettoyerOptionnel(ecoleActiveId);
    PolicyContexteActif.verifier({
      organisationActiveId: this.organisationActiveId,
      ecoleActiveId: this.ecoleActiveId,
      ecoleAppartientOrganisation,
    });
    this.version += 1;
    this.ajouterEvenement(new EcoleActiveChangee(this.obtenirId(), this.ecoleActiveId));
  }

  // Cette methode marque qu'un refresh de session vient d'etre realise.
  public marquerRefresh(dateRefresh = new Date()): void {
    this.dernierRefreshLe = SessionUtilisateur.validerDate(dateRefresh, 'dernierRefreshLe');
    this.version += 1;
  }

  public remplacerRefreshToken(idRefreshToken: string, dateRefresh = new Date()): void {
    this.refreshTokenId = SessionUtilisateur.validerTexte(idRefreshToken, 'refreshTokenId');
    this.marquerRefresh(dateRefresh);
  }

  // Cette methode active le mode offline pour la session.
  public activerModeOffline(): void {
    if (!this.estOffline) {
      this.estOffline = true;
      this.version += 1;
      this.ajouterEvenement(new SessionOfflineActivee(this.obtenirId(), this.idUtilisateur));
    }
  }

  // Cette methode retire le mode offline de la session.
  public desactiverModeOffline(): void {
    if (this.estOffline) {
      this.estOffline = false;
      this.version += 1;
    }
  }

  // Cette methode verifie que la session reste encore valide.
  public verifierValidite(): void {
    PolicySessionPersistante.verifier({ revoqueeLe: this.revoqueeLe });
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }

  private static clonerDateOptionnelle(valeur?: Date): Date | undefined {
    return valeur ? new Date(valeur.getTime()) : undefined;
  }

  private static validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${nomChamp} est invalide.`);
    }
    return new Date(valeur.getTime());
  }

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version de la session doit etre un entier strictement positif.');
    }
    return valeur;
  }
}
