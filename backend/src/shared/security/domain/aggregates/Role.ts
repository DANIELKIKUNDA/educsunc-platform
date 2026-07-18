import { randomUUID } from 'node:crypto';
import { RacineAgregat } from '../../../domain/AggregateRoot';
import { PermissionAjouteeRole } from '../events/PermissionAjouteeRole';
import { PermissionRetireeRole } from '../events/PermissionRetireeRole';
import { RestrictionAjouteeRole } from '../events/RestrictionAjouteeRole';
import { RoleActive } from '../events/RoleActive';
import { RoleCree } from '../events/RoleCree';
import { RoleDesactive } from '../events/RoleDesactive';
import { PermissionRole } from '../entities/PermissionRole';
import { RestrictionRole } from '../entities/RestrictionRole';
import { ErreurPermissionDupliquee } from '../exceptions/ErreurPermissionDupliquee';
import { ErreurPermissionRefusee } from '../exceptions/ErreurPermissionRefusee';
import { ErreurRoleInactif } from '../exceptions/ErreurRoleInactif';
import { ErreurRoleSystemeNonModifiable } from '../exceptions/ErreurRoleSystemeNonModifiable';
import { CodeRestrictionMetier } from '../value-objects/CodeRestrictionMetier';
import { CodeRole } from '../value-objects/CodeRole';
import { NiveauAcces } from '../value-objects/NiveauAcces';
import { PermissionSecurite } from '../value-objects/PermissionSecurite';

export interface ProprietesRole {
  idRole: string;
  codeRole: CodeRole;
  nomRole: string;
  description?: string;
  niveauAcces: NiveauAcces;
  estSysteme: boolean;
  estActif: boolean;
  creeLe: Date;
  creePar?: string;
  modifieLe?: Date;
  modifiePar?: string;
  version: number;
  permissions: PermissionRole[];
  restrictions: RestrictionRole[];
}

// Cet agregat represente un role officiel et la gouvernance qui l'accompagne.
export class Role extends RacineAgregat<string> {
  private codeRole: CodeRole;
  private nomRole: string;
  private description?: string;
  private niveauAcces: NiveauAcces;
  private estSysteme: boolean;
  private estActif: boolean;
  private creeLe: Date;
  private creePar?: string;
  private modifieLe?: Date;
  private modifiePar?: string;
  private version: number;
  private permissions: PermissionRole[];
  private restrictions: RestrictionRole[];

  constructor(proprietes: ProprietesRole) {
    super(Role.validerTexte(proprietes.idRole, 'idRole'));
    this.codeRole = proprietes.codeRole;
    this.nomRole = Role.validerTexte(proprietes.nomRole, 'nomRole');
    this.description = Role.nettoyerOptionnel(proprietes.description);
    this.niveauAcces = proprietes.niveauAcces;
    this.estSysteme = Boolean(proprietes.estSysteme);
    this.estActif = Boolean(proprietes.estActif);
    this.creeLe = new Date(proprietes.creeLe.getTime());
    this.creePar = Role.nettoyerOptionnel(proprietes.creePar);
    this.modifieLe = proprietes.modifieLe ? new Date(proprietes.modifieLe.getTime()) : undefined;
    this.modifiePar = Role.nettoyerOptionnel(proprietes.modifiePar);
    this.version = Role.validerVersion(proprietes.version);
    this.permissions = [...proprietes.permissions];
    this.restrictions = [...proprietes.restrictions];
    this.verifierInvariants();
  }

  public static creer(params: {
    codeRole: string;
    nomRole: string;
    description?: string;
    niveauAcces: string;
    estSysteme?: boolean;
    creePar?: string;
    permissions: string[];
  }): Role {
    const role = new Role({
      idRole: randomUUID(),
      codeRole: new CodeRole(params.codeRole),
      nomRole: params.nomRole,
      description: params.description,
      niveauAcces: new NiveauAcces(params.niveauAcces),
      estSysteme: params.estSysteme ?? false,
      estActif: true,
      creeLe: new Date(),
      creePar: params.creePar,
      version: 1,
      permissions: params.permissions.map((permission) => PermissionRole.creer(new PermissionSecurite(permission), params.creePar)),
      restrictions: [],
    });
    role.ajouterEvenement(new RoleCree(role.obtenirId(), role.codeRole.obtenirValeur()));
    return role;
  }

  public obtenirCodeRole(): CodeRole { return this.codeRole; }
  public obtenirNomRole(): string { return this.nomRole; }
  public obtenirDescription(): string | undefined { return this.description; }
  public obtenirNiveauAcces(): NiveauAcces { return this.niveauAcces; }
  public obtenirEstSysteme(): boolean { return this.estSysteme; }
  public obtenirEstActif(): boolean { return this.estActif; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }
  public obtenirCreePar(): string | undefined { return this.creePar; }
  public obtenirModifieLe(): Date | undefined { return this.modifieLe ? new Date(this.modifieLe.getTime()) : undefined; }
  public obtenirModifiePar(): string | undefined { return this.modifiePar; }
  public obtenirPermissions(): readonly PermissionRole[] { return [...this.permissions]; }
  public obtenirRestrictions(): readonly RestrictionRole[] { return [...this.restrictions]; }
  public obtenirVersion(): number { return this.version; }

  public activer(): void {
    this.estActif = true;
    this.marquerModification();
    this.ajouterEvenement(new RoleActive(this.obtenirId()));
  }

  public desactiver(): void {
    this.interdireModificationRoleSysteme();
    this.estActif = false;
    this.marquerModification();
    this.ajouterEvenement(new RoleDesactive(this.obtenirId()));
  }

  public ajouterPermission(permission: string, creePar?: string): void {
    this.interdireModificationRoleSysteme();
    const permissionVO = new PermissionSecurite(permission);
    if (this.permissions.some((item) => item.obtenirPermission().obtenirValeur() === permissionVO.obtenirValeur())) {
      throw new ErreurPermissionDupliquee();
    }

    this.permissions.push(PermissionRole.creer(permissionVO, creePar));
    this.marquerModification();
    this.ajouterEvenement(new PermissionAjouteeRole(this.obtenirId(), permissionVO.obtenirValeur()));
  }

  public retirerPermission(permission: string): void {
    this.interdireModificationRoleSysteme();
    const valeur = new PermissionSecurite(permission).obtenirValeur();
    const initial = this.permissions.length;
    this.permissions = this.permissions.filter((item) => item.obtenirPermission().obtenirValeur() !== valeur);
    if (initial === this.permissions.length) {
      throw new ErreurPermissionRefusee('La permission a retirer est absente du role.');
    }
    this.verifierInvariants();
    this.marquerModification();
    this.ajouterEvenement(new PermissionRetireeRole(this.obtenirId(), valeur));
  }

  public ajouterRestriction(codeRestriction: string, description?: string): void {
    this.interdireModificationRoleSysteme();
    const restriction = RestrictionRole.creer(new CodeRestrictionMetier(codeRestriction), description);
    this.restrictions.push(restriction);
    this.marquerModification();
    this.ajouterEvenement(new RestrictionAjouteeRole(this.obtenirId(), restriction.obtenirCodeRestriction().obtenirValeur()));
  }

  public retirerRestriction(codeRestriction: string): void {
    this.interdireModificationRoleSysteme();
    const valeur = new CodeRestrictionMetier(codeRestriction).obtenirValeur();
    this.restrictions = this.restrictions.filter((item) => item.obtenirCodeRestriction().obtenirValeur() !== valeur);
    this.marquerModification();
  }

  public verifierPermission(permission: string): void {
    if (!this.estActif) {
      throw new ErreurRoleInactif();
    }

    const valeur = new PermissionSecurite(permission).obtenirValeur();
    if (!this.permissions.some((item) => item.obtenirPermission().obtenirValeur() === valeur)) {
      throw new ErreurPermissionRefusee();
    }
  }

  public verifierRestriction(codeRestriction: string): boolean {
    const valeur = new CodeRestrictionMetier(codeRestriction).obtenirValeur();
    return this.restrictions.some((item) => item.obtenirCodeRestriction().obtenirValeur() === valeur);
  }

  private interdireModificationRoleSysteme(): void {
    if (this.estSysteme) {
      throw new ErreurRoleSystemeNonModifiable();
    }
  }

  private verifierInvariants(): void {
    if (this.permissions.length === 0) {
      throw new Error('Un role doit posseder au moins une permission.');
    }
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
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

  private static validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new Error('La version du role est invalide.');
    }
    return valeur;
  }
}
