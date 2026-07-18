import {
  AffectationTitulariat,
  AffectationUtilisateur,
  ContexteActifUtilisateur,
  MoteurCapacitesEffectives,
  MoteurAutorisation,
  MoteurRestrictionsMetier,
  MoteurScope,
  MoteurTitulariat,
  Role,
} from 'shared/security/domain';
import type {
  ClockPort,
  SecurityNotificationPort,
  SessionContextPort,
  TenantValidationPort,
  VerifierTitulariatClasseQuery,
} from 'shared/security/application';
import {
  SecurityAffectationService,
  SecurityContextService,
  SecurityFacade,
  SecurityRoleService,
} from 'shared/security/application';
import { PermissionCacheService } from 'shared/security/infrastructure';
import { obtenirMemoireSecurityTest } from './SecurityLegacyMemoryStore';
import {
  MemoireAffectationTestRepository,
  MemoireContexteTestRepository,
  MemoirePermissionTestRepository,
  MemoireRoleTestRepository,
  MemoireTitulariatTestRepository,
} from './SecurityMemoryTestRepositories';

// Ce fichier regroupe les fabriques et doublures simples pour les tests SECURITY.

export function reinitialiserMemoireSecurity(): void {
  const store = obtenirMemoireSecurityTest();
  store.roles.clear();
  store.rolesParCode.clear();
  store.affectations.clear();
  store.titulariats.clear();
  store.contextesActifs.clear();
  store.scopes.clear();
  store.securityAccessLogs.length = 0;
  store.securityPermissionDeniedLogs.length = 0;
}

export function creerRole(params?: Partial<{
  codeRole: string;
  nomRole: string;
  niveauAcces: string;
  permissions: string[];
  creePar: string;
  estSysteme: boolean;
}>): Role {
  return Role.creer({
    codeRole: params?.codeRole ?? 'ENSEIGNANT',
    nomRole: params?.nomRole ?? 'Enseignant',
    niveauAcces: params?.niveauAcces ?? 'ECOLE',
    permissions: params?.permissions ?? ['cotes.write'],
    creePar: params?.creePar ?? 'tests',
    estSysteme: params?.estSysteme ?? false,
  });
}

export function creerAffectationUtilisateur(params?: Partial<{
  idUtilisateur: string;
  idRole: string;
  niveauAcces: string;
  idOrganisation: string;
  idEcole: string;
  idSection: string;
  idClasse: string;
  idCours: string;
  creePar: string;
}>): AffectationUtilisateur {
  return AffectationUtilisateur.creer({
    idUtilisateur: params?.idUtilisateur ?? 'utilisateur-1',
    idRole: params?.idRole ?? 'role-1',
    niveauAcces: params?.niveauAcces ?? 'ECOLE',
    idOrganisation: params?.idOrganisation ?? 'org-1',
    idEcole: params?.idEcole ?? 'ecole-1',
    idSection: params?.idSection,
    idClasse: params?.idClasse,
    idCours: params?.idCours,
    creePar: params?.creePar ?? 'tests',
  });
}

export function creerAffectationTitulariat(params?: Partial<{
  idUtilisateur: string;
  idOrganisation: string;
  idEcole: string;
  idClasse: string;
  idAnneeScolaire: string;
  creePar: string;
}>): AffectationTitulariat {
  return AffectationTitulariat.attribuer({
    idUtilisateur: params?.idUtilisateur ?? 'utilisateur-1',
    idOrganisation: params?.idOrganisation ?? 'org-1',
    idEcole: params?.idEcole ?? 'ecole-1',
    idClasse: params?.idClasse ?? 'classe-1',
    idAnneeScolaire: params?.idAnneeScolaire ?? 'annee-1',
    creePar: params?.creePar ?? 'tests',
  });
}

export function creerContexteActifUtilisateur(params?: Partial<{
  idUtilisateur: string;
  idOrganisationActive: string;
  idEcoleActive: string;
}>): ContexteActifUtilisateur {
  const contexte = ContexteActifUtilisateur.creer(params?.idUtilisateur ?? 'utilisateur-1');
  if (params?.idOrganisationActive) {
    contexte.changerOrganisation(params.idOrganisationActive);
  }
  if (params?.idEcoleActive) {
    contexte.changerEcole(params.idEcoleActive, true);
  }
  return contexte;
}

export function creerRepositoriesMemoire() {
  reinitialiserMemoireSecurity();
  return {
    roleRepository: new MemoireRoleTestRepository(),
    permissionRepository: new MemoirePermissionTestRepository(),
    affectationRepository: new MemoireAffectationTestRepository(),
    titulariatRepository: new MemoireTitulariatTestRepository(),
    contexteRepository: new MemoireContexteTestRepository(),
  };
}

export class ClockPortMemoire implements ClockPort {
  public maintenant(): Date {
    return new Date('2026-01-01T10:00:00.000Z');
  }
}

export class TransactionSecurityMemoire {
  public nombreTransactions = 0;

  public async executerDansTransaction<TResult>(operation: () => Promise<TResult>): Promise<TResult> {
    this.nombreTransactions += 1;
    return operation();
  }
}

export class TenantValidationPortMemoire implements TenantValidationPort {
  constructor(
    private readonly organisationsAutorisees: readonly string[] = ['org-1'],
    private readonly ecolesAutorisees: readonly string[] = ['ecole-1'],
    private readonly couplesAutorises: ReadonlyArray<{ idOrganisation: string; idEcole: string }> = [{ idOrganisation: 'org-1', idEcole: 'ecole-1' }],
  ) {}

  public async verifierOrganisation(idOrganisation: string): Promise<boolean> {
    return this.organisationsAutorisees.includes(idOrganisation);
  }

  public async verifierEcole(idEcole: string): Promise<boolean> {
    return this.ecolesAutorisees.includes(idEcole);
  }

  public async verifierAppartenanceEcoleOrganisation(idEcole: string, idOrganisation: string): Promise<boolean> {
    return this.couplesAutorises.some((couple) => couple.idOrganisation === idOrganisation && couple.idEcole === idEcole);
  }
}

export class SessionContextPortMemoire implements SessionContextPort {
  constructor(private readonly utilisateur: {
    idUtilisateur: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  } | null = { idUtilisateur: 'utilisateur-1', organisationActiveId: 'org-1', ecoleActiveId: 'ecole-1' }) {}

  public async obtenirUtilisateurAuthentifie() {
    return this.utilisateur;
  }
}

export class NotificationPortMemoire implements SecurityNotificationPort {
  public readonly notifications: Array<{ idUtilisateur: string; action: string; details?: Record<string, unknown> }> = [];

  public async notifierAccesSensible(params: {
    idUtilisateur: string;
    action: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    this.notifications.push(params);
  }
}

export class VerifierTitulariatClasseQueryMemoire implements VerifierTitulariatClasseQuery {
  constructor(private readonly resultat: boolean = false) {}

  public async executer(): Promise<boolean> {
    return this.resultat;
  }
}

export function creerSecurityRoleService() {
  const repositories = creerRepositoriesMemoire();
  return {
    repositories,
    service: new SecurityRoleService(
      repositories.roleRepository,
      repositories.permissionRepository,
      new ClockPortMemoire(),
    ),
  };
}

export function creerSecurityAffectationService(options?: {
  classePossedeDejaTitulaire?: boolean;
}) {
  const repositories = creerRepositoriesMemoire();
  const notificationPort = new NotificationPortMemoire();
  return {
    repositories,
    notificationPort,
    service: new SecurityAffectationService(
      repositories.affectationRepository,
      repositories.roleRepository,
      repositories.titulariatRepository,
      new VerifierTitulariatClasseQueryMemoire(options?.classePossedeDejaTitulaire ?? false),
      notificationPort,
      new MoteurTitulariat(),
    ),
  };
}

export function creerSecurityContextService(options?: {
  organisationsAutorisees?: readonly string[];
  ecolesAutorisees?: readonly string[];
  utilisateurSession?: { idUtilisateur: string; organisationActiveId?: string; ecoleActiveId?: string } | null;
}) {
  const repositories = creerRepositoriesMemoire();
  return {
    repositories,
    service: new SecurityContextService(
      repositories.contexteRepository,
      new TenantValidationPortMemoire(
        options?.organisationsAutorisees,
        options?.ecolesAutorisees,
        [{ idOrganisation: 'org-1', idEcole: 'ecole-1' }],
      ),
      new SessionContextPortMemoire(options?.utilisateurSession),
      new MoteurScope(),
    ),
  };
}

export function creerSecurityFacade() {
  const repositories = creerRepositoriesMemoire();
  const permissionCache = new PermissionCacheService();
  return {
    repositories,
    permissionCache,
    facade: new SecurityFacade(
      repositories.roleRepository,
      repositories.affectationRepository,
      repositories.titulariatRepository,
      permissionCache,
      new MoteurAutorisation(),
      new MoteurScope(),
      new MoteurRestrictionsMetier(),
      new MoteurCapacitesEffectives(),
    ),
  };
}

export function obtenirAuditLogsSecurity() {
  return obtenirMemoireSecurityTest().securityAccessLogs;
}

export function obtenirAuditRefusSecurity() {
  return obtenirMemoireSecurityTest().securityPermissionDeniedLogs;
}

export class MemoireSecurityAuditTestService {
  public async journaliser(entree: Record<string, unknown>): Promise<void> {
    const store = obtenirMemoireSecurityTest();
    store.securityAccessLogs.push(structuredClone(entree));
    if (entree.succes === false) store.securityPermissionDeniedLogs.push(structuredClone(entree));
  }
}
