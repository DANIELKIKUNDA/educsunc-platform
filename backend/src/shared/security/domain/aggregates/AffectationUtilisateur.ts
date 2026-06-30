import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { AffectationUtilisateurActivee } from '../events/AffectationUtilisateurActivee';
import { AffectationUtilisateurCreee } from '../events/AffectationUtilisateurCreee';
import { AffectationUtilisateurExpiree } from '../events/AffectationUtilisateurExpiree';
import { ScopeAjouteAffectation } from '../events/ScopeAjouteAffectation';
import { ScopeAcces } from '../entities/ScopeAcces';
import { ErreurAffectationExpiree } from '../exceptions/ErreurAffectationExpiree';
import { ErreurAffectationInvalide } from '../exceptions/ErreurAffectationInvalide';
import { EtatAffectation } from '../value-objects/EtatAffectation';
import { NiveauAcces } from '../value-objects/NiveauAcces';
import { TypeScope } from '../value-objects/TypeScope';

export interface ProprietesAffectationUtilisateur {
  idAffectationUtilisateur: string;
  idUtilisateur: string;
  idRole: string;
  niveauAcces: NiveauAcces;
  idOrganisation?: string;
  idEcole?: string;
  idSection?: string;
  idClasse?: string;
  idCours?: string;
  etatAffectation: EtatAffectation;
  dateDebut: Date;
  dateFin?: Date;
  creeLe: Date;
  creePar?: string;
  version: number;
  scopes: ScopeAcces[];
}

// Cet agregat represente la portee metier concrete d'un utilisateur.
export class AffectationUtilisateur extends RacineAgregat<string> {
  private idUtilisateur: string;
  private idRole: string;
  private niveauAcces: NiveauAcces;
  private idOrganisation?: string;
  private idEcole?: string;
  private idSection?: string;
  private idClasse?: string;
  private idCours?: string;
  private etatAffectation: EtatAffectation;
  private dateDebut: Date;
  private dateFin?: Date;
  private creeLe: Date;
  private creePar?: string;
  private version: number;
  private scopes: ScopeAcces[];

  constructor(proprietes: ProprietesAffectationUtilisateur) {
    super(AffectationUtilisateur.validerTexte(proprietes.idAffectationUtilisateur, 'idAffectationUtilisateur'));
    this.idUtilisateur = AffectationUtilisateur.validerTexte(proprietes.idUtilisateur, 'idUtilisateur');
    this.idRole = AffectationUtilisateur.validerTexte(proprietes.idRole, 'idRole');
    this.niveauAcces = proprietes.niveauAcces;
    this.idOrganisation = AffectationUtilisateur.nettoyerOptionnel(proprietes.idOrganisation);
    this.idEcole = AffectationUtilisateur.nettoyerOptionnel(proprietes.idEcole);
    this.idSection = AffectationUtilisateur.nettoyerOptionnel(proprietes.idSection);
    this.idClasse = AffectationUtilisateur.nettoyerOptionnel(proprietes.idClasse);
    this.idCours = AffectationUtilisateur.nettoyerOptionnel(proprietes.idCours);
    this.etatAffectation = proprietes.etatAffectation;
    this.dateDebut = new Date(proprietes.dateDebut.getTime());
    this.dateFin = proprietes.dateFin ? new Date(proprietes.dateFin.getTime()) : undefined;
    this.creeLe = new Date(proprietes.creeLe.getTime());
    this.creePar = AffectationUtilisateur.nettoyerOptionnel(proprietes.creePar);
    this.version = proprietes.version;
    this.scopes = [...proprietes.scopes];
    this.verifierInvariants();
  }

  public static creer(params: {
    idUtilisateur: string;
    idRole: string;
    niveauAcces: string;
    idOrganisation?: string;
    idEcole?: string;
    idSection?: string;
    idClasse?: string;
    idCours?: string;
    creePar?: string;
  }): AffectationUtilisateur {
    const affectation = new AffectationUtilisateur({
      idAffectationUtilisateur: randomUUID(),
      idUtilisateur: params.idUtilisateur,
      idRole: params.idRole,
      niveauAcces: new NiveauAcces(params.niveauAcces),
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idSection: params.idSection,
      idClasse: params.idClasse,
      idCours: params.idCours,
      etatAffectation: new EtatAffectation('ACTIVE'),
      dateDebut: new Date(),
      creeLe: new Date(),
      creePar: params.creePar,
      version: 1,
      scopes: [],
    });
    affectation.ajouterEvenement(new AffectationUtilisateurCreee(affectation.obtenirId(), affectation.idUtilisateur));
    return affectation;
  }

  public obtenirIdUtilisateur(): string { return this.idUtilisateur; }
  public obtenirIdRole(): string { return this.idRole; }
  public obtenirNiveauAcces(): NiveauAcces { return this.niveauAcces; }
  public obtenirEtatAffectation(): EtatAffectation { return this.etatAffectation; }
  public obtenirScopes(): readonly ScopeAcces[] { return [...this.scopes]; }
  public obtenirIdOrganisation(): string | undefined { return this.idOrganisation; }
  public obtenirIdEcole(): string | undefined { return this.idEcole; }
  public obtenirIdSection(): string | undefined { return this.idSection; }
  public obtenirIdClasse(): string | undefined { return this.idClasse; }
  public obtenirIdCours(): string | undefined { return this.idCours; }
  public obtenirDateDebut(): Date { return new Date(this.dateDebut.getTime()); }
  public obtenirDateFin(): Date | undefined { return this.dateFin ? new Date(this.dateFin.getTime()) : undefined; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirCreePar(): string | undefined { return this.creePar; }

  public activer(): void {
    this.etatAffectation = new EtatAffectation('ACTIVE');
    this.marquerModification();
    this.ajouterEvenement(new AffectationUtilisateurActivee(this.obtenirId()));
  }

  public desactiver(): void {
    this.etatAffectation = new EtatAffectation('INACTIVE');
    this.marquerModification();
  }

  public expirer(dateFin = new Date()): void {
    this.dateFin = new Date(dateFin.getTime());
    this.etatAffectation = new EtatAffectation('EXPIREE');
    this.marquerModification();
    this.ajouterEvenement(new AffectationUtilisateurExpiree(this.obtenirId()));
  }

  public ajouterScope(typeScope: string, valeurScope: string, estLectureSeule = false): void {
    const scope = ScopeAcces.creer(new TypeScope(typeScope), valeurScope, estLectureSeule);
    this.scopes.push(scope);
    this.marquerModification();
    this.ajouterEvenement(new ScopeAjouteAffectation(this.obtenirId(), typeScope, valeurScope));
  }

  public retirerScope(typeScope: string, valeurScope: string): void {
    const type = new TypeScope(typeScope).obtenirValeur();
    this.scopes = this.scopes.filter((scope) =>
      !(scope.obtenirTypeScope().obtenirValeur() === type && scope.obtenirValeurScope() === valeurScope));
    this.marquerModification();
  }

  public estValide(maintenant = new Date()): boolean {
    if (this.etatAffectation.obtenirValeur() !== 'ACTIVE') {
      return false;
    }

    if (this.dateFin && this.dateFin.getTime() <= maintenant.getTime()) {
      return false;
    }

    return true;
  }

  public verifierPortee(maintenant = new Date()): void {
    if (!this.estValide(maintenant)) {
      throw new ErreurAffectationExpiree();
    }
  }

  private verifierInvariants(): void {
    if (this.idCours && !this.idClasse) {
      throw new ErreurAffectationInvalide('Une affectation cours exige une classe.');
    }

    if (this.idEcole && !this.idOrganisation) {
      throw new ErreurAffectationInvalide('Une affectation ecole exige une organisation.');
    }
  }

  private marquerModification(): void {
    this.version += 1;
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre === '' ? undefined : propre;
  }
}
