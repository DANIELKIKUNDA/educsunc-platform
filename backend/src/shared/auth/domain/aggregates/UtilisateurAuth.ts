import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { CompteDesactive } from '../events/CompteDesactive';
import { CompteDeverrouille } from '../events/CompteDeverrouille';
import { CompteSuspendu } from '../events/CompteSuspendu';
import { CompteVerrouille } from '../events/CompteVerrouille';
import { MotDePasseChange } from '../events/MotDePasseChange';
import { TokenVersionIncremente } from '../events/TokenVersionIncremente';
import { UtilisateurAuthentifie } from '../events/UtilisateurAuthentifie';
import { PolicyCompteActif } from '../policies/PolicyCompteActif';
import { PolicyVerrouillageConnexion } from '../policies/PolicyVerrouillageConnexion';
import { AdresseEmail } from '../value-objects/AdresseEmail';
import { EtatCompteUtilisateur } from '../value-objects/EtatCompteUtilisateur';
import { MotDePasseHash } from '../value-objects/MotDePasseHash';
import { TokenVersion } from '../value-objects/TokenVersion';

export interface ProprietesUtilisateurAuth {
  idUtilisateur: string;
  nomComplet: string;
  email: AdresseEmail;
  telephone?: string;
  motDePasseHash: MotDePasseHash;
  etatCompte: EtatCompteUtilisateur;
  tokenVersion: TokenVersion;
  dernierAccesLe?: Date;
  dernierLoginLe?: Date;
  nombreTentativesConnexion: number;
  compteVerrouilleJusqua?: Date;
  authOfflineAutorisee: boolean;
  creeLe: Date;
  modifieLe?: Date;
  version: number;
  supprimeLogiquement: boolean;
}

// Cet agregat represente l'identite authentifiable transverse d'un utilisateur EduSync.
export class UtilisateurAuth extends RacineAgregat<string> {
  private nomComplet: string;
  private email: AdresseEmail;
  private telephone?: string;
  private motDePasseHash: MotDePasseHash;
  private etatCompte: EtatCompteUtilisateur;
  private tokenVersion: TokenVersion;
  private dernierAccesLe?: Date;
  private dernierLoginLe?: Date;
  private nombreTentativesConnexion: number;
  private compteVerrouilleJusqua?: Date;
  private authOfflineAutorisee: boolean;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;
  private supprimeLogiquement: boolean;

  constructor(proprietes: ProprietesUtilisateurAuth) {
    super(UtilisateurAuth.validerTexte(proprietes.idUtilisateur, 'idUtilisateur'));
    this.nomComplet = UtilisateurAuth.validerTexte(proprietes.nomComplet, 'nomComplet');
    this.email = proprietes.email;
    this.telephone = UtilisateurAuth.nettoyerOptionnel(proprietes.telephone);
    this.motDePasseHash = proprietes.motDePasseHash;
    this.etatCompte = proprietes.etatCompte;
    this.tokenVersion = proprietes.tokenVersion;
    this.dernierAccesLe = UtilisateurAuth.clonerDateOptionnelle(proprietes.dernierAccesLe);
    this.dernierLoginLe = UtilisateurAuth.clonerDateOptionnelle(proprietes.dernierLoginLe);
    this.nombreTentativesConnexion = UtilisateurAuth.validerCompteur(proprietes.nombreTentativesConnexion, 'nombreTentativesConnexion');
    this.compteVerrouilleJusqua = UtilisateurAuth.clonerDateOptionnelle(proprietes.compteVerrouilleJusqua);
    this.authOfflineAutorisee = Boolean(proprietes.authOfflineAutorisee);
    this.creeLe = UtilisateurAuth.validerDate(proprietes.creeLe, 'creeLe');
    this.modifieLe = UtilisateurAuth.clonerDateOptionnelle(proprietes.modifieLe);
    this.version = UtilisateurAuth.validerVersion(proprietes.version);
    this.supprimeLogiquement = Boolean(proprietes.supprimeLogiquement);
  }

  // Cette methode cree un utilisateur auth avec les valeurs par defaut du domaine.
  public static creer(params: {
    nomComplet: string;
    email: string;
    telephone?: string;
    motDePasseHash: string | MotDePasseHash;
    etatCompte?: EtatCompteUtilisateur;
    authOfflineAutorisee?: boolean;
    creeLe?: Date;
  }): UtilisateurAuth {
    return new UtilisateurAuth({
      idUtilisateur: randomUUID(),
      nomComplet: params.nomComplet,
      email: new AdresseEmail(params.email),
      telephone: params.telephone,
      motDePasseHash: params.motDePasseHash instanceof MotDePasseHash ? params.motDePasseHash : new MotDePasseHash(params.motDePasseHash),
      etatCompte: params.etatCompte ?? EtatCompteUtilisateur.ACTIVE,
      tokenVersion: new TokenVersion(1),
      nombreTentativesConnexion: 0,
      authOfflineAutorisee: params.authOfflineAutorisee ?? false,
      creeLe: params.creeLe ?? new Date(),
      version: 1,
      supprimeLogiquement: false,
    });
  }

  public obtenirNomComplet(): string { return this.nomComplet; }
  public obtenirEmail(): AdresseEmail { return this.email; }
  public obtenirTelephone(): string | undefined { return this.telephone; }
  public obtenirMotDePasseHash(): MotDePasseHash { return this.motDePasseHash; }
  public obtenirEtatCompte(): EtatCompteUtilisateur { return this.etatCompte; }
  public obtenirTokenVersion(): TokenVersion { return this.tokenVersion; }
  public obtenirDernierAccesLe(): Date | undefined { return UtilisateurAuth.clonerDateOptionnelle(this.dernierAccesLe); }
  public obtenirDernierLoginLe(): Date | undefined { return UtilisateurAuth.clonerDateOptionnelle(this.dernierLoginLe); }
  public obtenirNombreTentativesConnexion(): number { return this.nombreTentativesConnexion; }
  public obtenirCompteVerrouilleJusqua(): Date | undefined { return UtilisateurAuth.clonerDateOptionnelle(this.compteVerrouilleJusqua); }
  public obtenirAuthOfflineAutorisee(): boolean { return this.authOfflineAutorisee; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirModifieLe(): Date | undefined { return UtilisateurAuth.clonerDateOptionnelle(this.modifieLe); }
  public obtenirVersion(): number { return this.version; }
  public obtenirSupprimeLogiquement(): boolean { return this.supprimeLogiquement; }

  // Cette methode remplace le hash de mot de passe et invalide les anciens jetons.
  public changerMotDePasse(nouveauMotDePasseHash: string | MotDePasseHash): void {
    this.motDePasseHash = nouveauMotDePasseHash instanceof MotDePasseHash
      ? nouveauMotDePasseHash
      : new MotDePasseHash(nouveauMotDePasseHash);
    this.incrementerTokenVersion();
    this.marquerModification();
    this.ajouterEvenement(new MotDePasseChange(this.obtenirId()));
  }

  // Cette methode incremente le compteur d'echecs de connexion.
  public incrementerTentativeConnexion(): void {
    this.nombreTentativesConnexion += 1;
    this.marquerModification();
  }

  // Cette methode remet le compteur d'echecs a zero.
  public reinitialiserTentativesConnexion(): void {
    this.nombreTentativesConnexion = 0;
    this.marquerModification();
  }

  // Cette methode verrouille le compte jusqu'a une date donnee.
  public verrouillerCompte(jusqua: Date): void {
    this.compteVerrouilleJusqua = UtilisateurAuth.validerDate(jusqua, 'compteVerrouilleJusqua');
    this.marquerModification();
    this.ajouterEvenement(new CompteVerrouille(this.obtenirId(), this.compteVerrouilleJusqua));
  }

  // Cette methode deverrouille explicitement le compte et remet les echecs a zero.
  public deverrouillerCompte(): void {
    this.compteVerrouilleJusqua = undefined;
    this.nombreTentativesConnexion = 0;
    this.marquerModification();
    this.ajouterEvenement(new CompteDeverrouille(this.obtenirId()));
  }

  // Cette methode remet un compte dans l'etat actif.
  public activerCompte(): void {
    this.etatCompte = EtatCompteUtilisateur.ACTIVE;
    this.marquerModification();
  }

  // Cette methode suspend un compte sans le supprimer.
  public suspendreCompte(): void {
    this.etatCompte = EtatCompteUtilisateur.SUSPENDED;
    this.incrementerTokenVersion();
    this.marquerModification();
    this.ajouterEvenement(new CompteSuspendu(this.obtenirId()));
  }

  // Cette methode desactive un compte de facon forte.
  public desactiverCompte(): void {
    this.etatCompte = EtatCompteUtilisateur.DISABLED;
    this.incrementerTokenVersion();
    this.marquerModification();
    this.ajouterEvenement(new CompteDesactive(this.obtenirId()));
  }

  // Cette methode incremente la version logique des jetons.
  public incrementerTokenVersion(): void {
    this.tokenVersion = this.tokenVersion.incrementer();
    this.ajouterEvenement(new TokenVersionIncremente(this.obtenirId(), this.tokenVersion.obtenirValeur()));
  }

  // Cette methode met a jour le dernier acces observe pour l'utilisateur.
  public mettreAJourDernierAcces(dateAcces = new Date(), estConnexion = false): void {
    const valeur = UtilisateurAuth.validerDate(dateAcces, 'dernierAccesLe');
    this.dernierAccesLe = valeur;
    if (estConnexion) {
      this.dernierLoginLe = new Date(valeur.getTime());
    }
    this.marquerModification();
  }

  // Cette methode verifie qu'un utilisateur peut encore etre authentifie.
  public verifierConnexionAutorisee(maintenant = new Date()): void {
    PolicyCompteActif.verifier(this.etatCompte);
    PolicyVerrouillageConnexion.verifierCompteNonVerrouille(this.compteVerrouilleJusqua, maintenant);
  }

  // Cette methode marque explicitement une authentification reussie.
  public marquerAuthentificationReussie(organisationActiveId?: string, ecoleActiveId?: string): void {
    this.reinitialiserTentativesConnexion();
    this.mettreAJourDernierAcces(new Date(), true);
    this.ajouterEvenement(new UtilisateurAuthentifie(this.obtenirId(), organisationActiveId, ecoleActiveId));
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
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

  private static validerCompteur(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur < 0) {
      throw new Error(`Le champ ${nomChamp} doit etre un entier positif ou nul.`);
    }
    return valeur;
  }

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version de l utilisateur doit etre un entier strictement positif.');
    }
    return valeur;
  }
}
