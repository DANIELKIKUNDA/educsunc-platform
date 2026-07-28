import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { FastifyPluginAsync, FastifyReply } from 'fastify';
import {
  AuditAuthApplicationService,
  AuthApplicationService,
  AuthentificationOfflineUseCase,
  ChangerContexteActifSaga,
  ChangerEcoleActiveUseCase,
  ChangerOrganisationActiveUseCase,
  ContexteActifApplicationService,
  LoginSaga,
  LoginUseCase,
  LogoutSaga,
  LogoutUseCase,
  ObtenirContexteActifUseCase,
  OfflineAuthenticationSaga,
  RefreshTokenSaga,
  RefreshTokenUseCase,
  RevoquerToutesSessionsUtilisateurUseCase,
  SessionApplicationService,
} from '../../shared/auth/application';
import { MoteurAuthentification, MoteurContexteActif, MoteurOfflineAuth, MoteurRefreshToken, PolicyMotDePasseInitial } from '../../shared/auth/domain';
import {
  SecurityAuditAdapter,
  SecurityAuthorizationAdapter,
  SessionCacheService,
  JwtTokenAdapter,
  OfflineAuthAdapter,
  PostgresContexteActifAuthRepository,
  PostgresRefreshTokenRepository,
  PostgresSessionUtilisateurRepository,
  PostgresTentativeConnexionRepository,
  PostgresUtilisateurAuthRepository,
  AuthTransactionManager,
  obtenirClientPostgresAuth,
} from '../../shared/auth/infrastructure';
import {
  AuthOfflineController,
  ChangerEcoleActiveController,
  ChangerOrganisationActiveController,
  JwtAuthenticationMiddleware,
  LoginController,
  LogoutController,
  OfflineSyncMiddleware,
  RateLimitMiddleware,
  RefreshTokenController,
  RevocationSessionsController,
  SessionMiddleware,
  SessionUtilisateurController,
  TenantMiddleware,
  creerRoutesAuth,
  AccessTokenCookie,
  RefreshTokenCookie,
} from '../../shared/auth/interfaces/http';
import { AuthenticationMiddleware } from '../../shared/auth/infrastructure/middlewares/AuthenticationMiddleware';
import { AuthOfflineMiddleware } from '../../shared/auth/infrastructure/middlewares/AuthOfflineMiddleware';
import { SessionValidationMiddleware } from '../../shared/auth/infrastructure/middlewares/SessionValidationMiddleware';
import { TenantContextMiddleware } from '../../shared/auth/infrastructure/middlewares/TenantContextMiddleware';
import {
  MoteurAutorisation,
  MoteurCapacitesEffectives,
  MoteurRestrictionsMetier,
  MoteurScope,
} from '../../shared/security/domain';
import {
  PermissionCacheService,
  PostgresAffectationTitulariatRepository,
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
  SecurityAuditInfrastructureService,
} from '../../shared/security/infrastructure';
import { SecurityFacade } from '../../shared/security/application/services/SecurityFacade';
import { SecurityTenantIsolationService } from '../../shared/security/infrastructure/tenancy/SecurityTenantIsolationService';
import { configurationApplication } from '../../config/app.config';
import { chargerConfigurationAuth } from '../../config/auth.config';
import { UtilisateurAuth } from '../../shared/auth/domain/aggregates/UtilisateurAuth';
import { AffectationUtilisateur, Role, obtenirDefinitionRoleSysteme } from '../../shared/security/domain';
import { moduleActivationConfigurationService } from './configuration.routes';

const MOT_DE_PASSE_SESSION_DEV = 'EducSyn.dev.session.2026';
const ORGANISATION_DEV_PAR_DEFAUT = 'org-edusync-dev';
const ECOLE_DEV_PAR_DEFAUT = 'ecole-edusync-dev';

export function sessionDeveloppeurDisponible(environnement: string): boolean {
  return environnement === 'development';
}

type CodeActeurDeveloppement =
  | 'MANAGER_SYSTEME'
  | 'OPERATEUR_SYSTEME'
  | 'SUPPORT_SYSTEME'
  | 'PROMOTEUR_ORGANISATION'
  | 'ADMIN_SYSTEME_ORGANISATION'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'ADMIN_SYSTEME_ECOLE'
  | 'ADMINISTRATEUR_ECOLE'
  | 'CAISSIER'
  | 'SECRETAIRE'
  | 'ENSEIGNANT'
  | 'PREFET_ETUDES'
  | 'DIRECTEUR_ETUDES'
  | 'DIRECTEUR_DISCIPLINE'
  | 'DIRECTEUR_PRIMAIRE'
  | 'DIRECTEUR_MATERNELLE'
  | 'PARENT'
  | 'COMPTABLE';

interface RequeteSessionDeveloppeur {
  actorCode: CodeActeurDeveloppement;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  deviceId?: string;
}

interface ProfilSessionDeveloppeur {
  nomComplet: string;
  niveauAcces: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
}

interface RequeteInitialisationPlateforme {
  nom: string;
  postnom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmationMotDePasse: string;
  seSouvenirDeMoi?: boolean;
  deviceId?: string;
}

class InitialisationPlateformeFermeeError extends Error {
  constructor() {
    super('La premiere initialisation EduSync est deja terminee.');
    this.name = 'InitialisationPlateformeFermeeError';
  }
}

const profilsSessionDeveloppeur: Record<CodeActeurDeveloppement, ProfilSessionDeveloppeur> = {
  MANAGER_SYSTEME: { nomComplet: 'Nadia Ilunga', niveauAcces: 'PLATEFORME' },
  OPERATEUR_SYSTEME: { nomComplet: 'Joel Banza', niveauAcces: 'PLATEFORME' },
  SUPPORT_SYSTEME: { nomComplet: 'Sarah Mbuyi', niveauAcces: 'PLATEFORME' },
  PROMOTEUR_ORGANISATION: { nomComplet: 'Daniel Kikunda', niveauAcces: 'ORGANISATION' },
  ADMIN_SYSTEME_ORGANISATION: { nomComplet: 'Grace Kabamba', niveauAcces: 'ORGANISATION' },
  GESTIONNAIRE_ORGANISATION: { nomComplet: 'Patrick Mutombo', niveauAcces: 'ORGANISATION' },
  ADMIN_SYSTEME_ECOLE: { nomComplet: 'Patrick Mulumba', niveauAcces: 'ECOLE' },
  ADMINISTRATEUR_ECOLE: { nomComplet: 'Chantal Lukusa', niveauAcces: 'ECOLE' },
  CAISSIER: { nomComplet: 'Daniel Kikunda', niveauAcces: 'ECOLE' },
  SECRETAIRE: { nomComplet: 'Rachel Kalonji', niveauAcces: 'ECOLE' },
  ENSEIGNANT: { nomComplet: 'Michel Kabeya', niveauAcces: 'ECOLE' },
  PREFET_ETUDES: { nomComplet: 'Ruth Mukendi', niveauAcces: 'ECOLE' },
  DIRECTEUR_ETUDES: { nomComplet: 'Jean Kanku', niveauAcces: 'ECOLE' },
  DIRECTEUR_DISCIPLINE: { nomComplet: 'Didier Banza', niveauAcces: 'ECOLE' },
  DIRECTEUR_PRIMAIRE: { nomComplet: 'Mireille Tshiaba', niveauAcces: 'ECOLE' },
  DIRECTEUR_MATERNELLE: { nomComplet: 'Aline Mbayo', niveauAcces: 'ECOLE' },
  PARENT: { nomComplet: 'Aline Mwepu', niveauAcces: 'ECOLE' },
  COMPTABLE: { nomComplet: 'Comptable Demo', niveauAcces: 'ECOLE' },
};

export function construireIdUtilisateurDeveloppeur(actorCode: CodeActeurDeveloppement): string {
  const empreinte = createHash('sha256')
    .update(`educsync:dev-user:${actorCode}`)
    .digest('hex');
  return `${empreinte.slice(0, 8)}-${empreinte.slice(8, 12)}-5${empreinte.slice(13, 16)}-a${empreinte.slice(17, 20)}-${empreinte.slice(20, 32)}`;
}

class TenantContextAuthAdapter {
  private readonly securityTenantIsolationService = new SecurityTenantIsolationService();

  public async verifierContexteActif(params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<void> {
    this.securityTenantIsolationService.verifierCohorenceTenant(
      params.organisationActiveId,
      params.ecoleActiveId,
      true,
    );
  }

  public async verifierCoherenceTenant(params: {
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<boolean> {
    try {
      this.securityTenantIsolationService.verifierCohorenceTenant(
        params.organisationActiveId,
        params.ecoleActiveId,
        true,
      );
      return true;
    } catch {
      return false;
    }
  }
}

interface CompositionRoutesAuth {
  dependancesRoutes: Parameters<typeof creerRoutesAuth>[0];
  loginUseCase: LoginUseCase;
  activerContextePlateforme: (
    sessionId: string,
    utilisateurId: string,
  ) => Promise<{
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }>;
}

function verifierMotDePasseSynchrone(motDePasseClair: string, motDePasseHash: string): boolean {
  const parties = String(motDePasseHash || '').trim().split(':');
  if (parties.length !== 3 || parties[0] !== 'scrypt') {
    return false;
  }

  const sel = parties[1];
  const attendu = Buffer.from(parties[2], 'hex');
  const calcule = scryptSync(String(motDePasseClair || ''), sel, attendu.length, { N: 16384 });
  return attendu.length === calcule.length && timingSafeEqual(attendu, calcule);
}

function genererRefreshTokenSynchrone(): string {
  return randomBytes(48).toString('base64url');
}

function hacherMotDePasseSynchrone(motDePasseClair: string): string {
  const sel = randomBytes(16).toString('hex');
  const hash = scryptSync(String(motDePasseClair || ''), sel, 64, { N: 16384 }).toString('hex');
  return `scrypt:${sel}:${hash}`;
}

function lireRequeteInitialisationPlateforme(corps: unknown): RequeteInitialisationPlateforme {
  if (typeof corps !== 'object' || corps === null || Array.isArray(corps)) {
    throw new Error('Les informations du premier responsable sont obligatoires.');
  }

  const donnees = corps as Record<string, unknown>;
  const lireChamp = (nom: string): string => {
    const valeur = lireChaineOptionnelleDepuisObjet(donnees, nom);
    if (!valeur) {
      throw new Error(`Le champ ${nom} est obligatoire.`);
    }
    return valeur;
  };
  const motDePasse = lireChamp('motDePasse');
  const confirmationMotDePasse = lireChamp('confirmationMotDePasse');
  if (motDePasse !== confirmationMotDePasse) {
    throw new Error('La confirmation du mot de passe ne correspond pas.');
  }
  PolicyMotDePasseInitial.verifier(motDePasse);

  return {
    nom: lireChamp('nom'),
    postnom: lireChamp('postnom'),
    prenom: lireChamp('prenom'),
    email: lireChamp('email').toLowerCase(),
    motDePasse,
    confirmationMotDePasse,
    seSouvenirDeMoi: donnees.seSouvenirDeMoi === true,
    deviceId: lireChaineOptionnelleDepuisObjet(donnees, 'deviceId'),
  };
}

async function initialisationPlateformeRequise(): Promise<boolean> {
  const clientSql = obtenirClientPostgresAuth();
  const resultat = await clientSql.executer<{ initialisee: boolean; comptes_officiels: string }>(`
    SELECT
      EXISTS(SELECT 1 FROM auth_initialisation_plateforme WHERE singleton = TRUE) AS initialisee,
      (SELECT COUNT(*)::TEXT FROM auth_utilisateurs
       WHERE supprime_logiquement = FALSE
         AND email NOT LIKE 'dev.%@educsync.local') AS comptes_officiels
  `);
  const ligne = resultat.lignes[0];
  return !ligne?.initialisee && Number(ligne?.comptes_officiels ?? '0') === 0;
}

async function assurerAffectationManagerPlateforme(
  utilisateurId: string,
  roleRepository: PostgresRoleRepository,
  affectationUtilisateurRepository: PostgresAffectationUtilisateurRepository,
): Promise<void> {
  const role = await assurerRoleDeveloppeur(roleRepository, 'MANAGER_SYSTEME');
  const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(utilisateurId);
  if (affectations.some((affectation) => affectation.obtenirIdRole() === role.obtenirId())) {
    return;
  }

  const affectation = AffectationUtilisateur.creer({
    idUtilisateur: utilisateurId,
    idRole: role.obtenirId(),
    niveauAcces: 'PLATEFORME',
    creePar: 'initialisation-plateforme',
  });
  affectation.ajouterScope('PLATEFORME', 'system');
  await affectationUtilisateurRepository.sauvegarder(affectation);
}

async function restaurerAffectationManagerInitial(
  roleRepository: PostgresRoleRepository,
  affectationUtilisateurRepository: PostgresAffectationUtilisateurRepository,
): Promise<void> {
  const resultat = await obtenirClientPostgresAuth().executer<{ premier_utilisateur_id: string }>(
    'SELECT premier_utilisateur_id FROM auth_initialisation_plateforme WHERE singleton = TRUE',
  );
  const utilisateurId = resultat.lignes[0]?.premier_utilisateur_id;
  if (utilisateurId) {
    await assurerAffectationManagerPlateforme(
      utilisateurId,
      roleRepository,
      affectationUtilisateurRepository,
    );
  }
}

function appliquerCookiesInitialisation(
  reponse: FastifyReply,
  login: Record<string, unknown>,
  persistant: boolean,
): void {
  const secure = configurationApplication.environnement === 'production' ? '; Secure' : '';
  const maxAgeRefresh = persistant ? `; Max-Age=${10 * 365 * 24 * 60 * 60}` : '';
  reponse.header('set-cookie', [
    `${AccessTokenCookie.NOM}=${encodeURIComponent(String(login.accessToken ?? ''))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${chargerConfigurationAuth().dureeAccessTokenSecondes}${secure}`,
    `${RefreshTokenCookie.NOM}=${encodeURIComponent(String(login.refreshToken ?? ''))}; Path=/; HttpOnly; SameSite=Strict${maxAgeRefresh}${secure}`,
  ]);
}

function masquerRefreshToken<T extends Record<string, unknown>>(donnee: T): Omit<T, 'refreshToken'> {
  const { refreshToken: _refreshToken, ...donneePublique } = donnee;
  return donneePublique;
}

function composerRoutesAuth(): CompositionRoutesAuth {
  const configurationAuth = chargerConfigurationAuth();
  const jwtTokenAdapter = new JwtTokenAdapter(configurationAuth);
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const depotSessionUtilisateur = new PostgresSessionUtilisateurRepository();
  const depotRefreshToken = new PostgresRefreshTokenRepository();
  const depotContexteActifAuth = new PostgresContexteActifAuthRepository();
  const depotTentativeConnexion = new PostgresTentativeConnexionRepository();
  const affectationUtilisateurRepository = new PostgresAffectationUtilisateurRepository();
  const affectationTitulariatRepository = new PostgresAffectationTitulariatRepository();
  const roleRepository = new PostgresRoleRepository();

  const permissionCache = new PermissionCacheService();
  const securityFacade = new SecurityFacade(
    roleRepository,
    affectationUtilisateurRepository,
    affectationTitulariatRepository,
    permissionCache,
    new MoteurAutorisation(),
    new MoteurScope(),
    new MoteurRestrictionsMetier(),
    new MoteurCapacitesEffectives(),
    new SecurityAuditInfrastructureService(),
  );
  const securityAuthorizationPort = new SecurityAuthorizationAdapter({
    verifierScopes: async (utilisateurId) => {
      await securityFacade.verifierScope({ idUtilisateur: utilisateurId });
    },
    verifierAccesOrganisation: async (utilisateurId, organisationActiveId) => {
      try {
        await securityFacade.verifierScope({
          idUtilisateur: utilisateurId,
          idOrganisation: organisationActiveId,
        });
        return true;
      } catch {
        return false;
      }
    },
    verifierAccesEcole: async (utilisateurId, ecoleActiveId) => {
      try {
        await securityFacade.verifierScope({
          idUtilisateur: utilisateurId,
          idEcole: ecoleActiveId,
        });
        return true;
      } catch {
        return false;
      }
    },
    resoudreRoleActif: async (utilisateurId) => {
      const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(utilisateurId);
      for (const affectation of affectations) {
        const role = await roleRepository.trouverParId(affectation.obtenirIdRole());
        if (role?.obtenirEstActif()) {
          return role.obtenirCodeRole().obtenirValeur();
        }
      }
      return undefined;
    },
    resoudrePermissionsEffectives: async (utilisateurId) => {
      const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(utilisateurId);
      const permissions = new Set<string>();
      for (const affectation of affectations) {
        const role = await roleRepository.trouverParId(affectation.obtenirIdRole());
        role?.obtenirPermissions().forEach((permission) => {
          permissions.add(permission.obtenirPermission().obtenirValeur());
        });
      }
      return [...permissions];
    },
  });

  const transactionManager = new AuthTransactionManager();
  const auditAuthApplicationService = new AuditAuthApplicationService(new SecurityAuditAdapter());
  const sessionCache = new SessionCacheService();
  const offlineAuthAdapter = new OfflineAuthAdapter();
  const sessionApplicationService = new SessionApplicationService(
    depotSessionUtilisateur,
    depotRefreshToken,
    sessionCache,
  );
  const offlineAuthenticationSaga = new OfflineAuthenticationSaga(
    transactionManager,
    depotUtilisateurAuth,
    depotSessionUtilisateur,
    depotContexteActifAuth,
    offlineAuthAdapter,
    auditAuthApplicationService,
    new MoteurOfflineAuth(),
  );

  const authApplicationService = new AuthApplicationService(
    new LoginSaga(
      transactionManager,
      depotUtilisateurAuth,
      depotSessionUtilisateur,
      depotRefreshToken,
      depotContexteActifAuth,
      depotTentativeConnexion,
      securityAuthorizationPort,
      auditAuthApplicationService,
      new MoteurAuthentification({
        verifierMotDePasse: verifierMotDePasseSynchrone,
        genererJwt: (payload) => jwtTokenAdapter.signerJwtSynchrone(payload),
        genererRefreshTokenValue: genererRefreshTokenSynchrone,
        hacherRefreshToken: (valeur) => jwtTokenAdapter.hacherRefreshTokenSynchrone(valeur),
      }),
    ),
    new LogoutSaga(
      transactionManager,
      depotSessionUtilisateur,
      depotRefreshToken,
      sessionCache,
      auditAuthApplicationService,
    ),
    new RefreshTokenSaga(
      transactionManager,
      depotRefreshToken,
      depotSessionUtilisateur,
      depotUtilisateurAuth,
      jwtTokenAdapter,
      new MoteurRefreshToken({
        genererRefreshTokenValue: genererRefreshTokenSynchrone,
        hacherRefreshToken: (valeur) => jwtTokenAdapter.hacherRefreshTokenSynchrone(valeur),
      }),
      sessionCache,
      auditAuthApplicationService,
      securityAuthorizationPort,
    ),
    offlineAuthenticationSaga,
  );

  const contexteActifApplicationService = new ContexteActifApplicationService(
    depotContexteActifAuth,
    securityAuthorizationPort,
    new TenantContextAuthAdapter(),
    new MoteurContexteActif(),
  );
  const changerContexteActifSaga = new ChangerContexteActifSaga(
    transactionManager,
    contexteActifApplicationService,
    sessionApplicationService,
    auditAuthApplicationService,
  );

  const loginUseCase = new LoginUseCase(authApplicationService);
  const logoutUseCase = new LogoutUseCase(authApplicationService);
  const refreshTokenUseCase = new RefreshTokenUseCase(authApplicationService);
  const obtenirContexteActifUseCase = new ObtenirContexteActifUseCase(
    contexteActifApplicationService,
  );
  const changerOrganisationActiveUseCase = new ChangerOrganisationActiveUseCase(
    sessionApplicationService,
    changerContexteActifSaga,
  );
  const changerEcoleActiveUseCase = new ChangerEcoleActiveUseCase(
    sessionApplicationService,
    changerContexteActifSaga,
  );
  const revoquerToutesSessionsUtilisateurUseCase = new RevoquerToutesSessionsUtilisateurUseCase(
    transactionManager,
    depotUtilisateurAuth,
    depotSessionUtilisateur,
    depotRefreshToken,
    auditAuthApplicationService,
  );
  const authentificationOfflineUseCase = new AuthentificationOfflineUseCase(authApplicationService);

  return {
    loginUseCase,
    activerContextePlateforme: (sessionId, utilisateurId) =>
      changerContexteActifSaga.activerPlateforme(sessionId, utilisateurId),
    dependancesRoutes: {
      loginController: new LoginController(loginUseCase),
      logoutController: new LogoutController(logoutUseCase),
      refreshTokenController: new RefreshTokenController(refreshTokenUseCase),
      changerOrganisationActiveController: new ChangerOrganisationActiveController(
        changerOrganisationActiveUseCase,
      ),
      changerEcoleActiveController: new ChangerEcoleActiveController(
        changerEcoleActiveUseCase,
      ),
      sessionUtilisateurController: new SessionUtilisateurController(
        sessionApplicationService,
        obtenirContexteActifUseCase,
      ),
      revocationSessionsController: new RevocationSessionsController(
        revoquerToutesSessionsUtilisateurUseCase,
      ),
      authOfflineController: new AuthOfflineController(authentificationOfflineUseCase),
      jwtAuthenticationMiddleware: new JwtAuthenticationMiddleware(
        new AuthenticationMiddleware(jwtTokenAdapter),
      ),
      sessionMiddleware: new SessionMiddleware(
        new SessionValidationMiddleware(sessionApplicationService),
      ),
      tenantMiddleware: new TenantMiddleware(
        new TenantContextMiddleware(new TenantContextAuthAdapter()),
      ),
      offlineSyncMiddleware: new OfflineSyncMiddleware(
        new AuthOfflineMiddleware(offlineAuthAdapter),
      ),
      rateLimitMiddleware: new RateLimitMiddleware(),
    },
  };
}

function lireChaineOptionnelleDepuisObjet(
  donnees: Record<string, unknown>,
  nomChamp: string,
): string | undefined {
  const valeur = donnees[nomChamp];
  if (typeof valeur !== 'string') {
    return undefined;
  }

  const nettoyee = valeur.trim();
  return nettoyee.length > 0 ? nettoyee : undefined;
}

function lireRequeteSessionDeveloppeur(corps: unknown): RequeteSessionDeveloppeur {
  if (typeof corps !== 'object' || corps === null || Array.isArray(corps)) {
    throw new Error('Le corps de session developpeur est invalide.');
  }

  const donnees = corps as Record<string, unknown>;
  const actorCode = lireChaineOptionnelleDepuisObjet(donnees, 'actorCode');
  if (!actorCode || !(actorCode in profilsSessionDeveloppeur)) {
    throw new Error("Le champ actorCode est obligatoire pour ouvrir une session developpeur.");
  }

  return {
    actorCode: actorCode as CodeActeurDeveloppement,
    organisationActiveId: lireChaineOptionnelleDepuisObjet(donnees, 'organisationActiveId'),
    ecoleActiveId: lireChaineOptionnelleDepuisObjet(donnees, 'ecoleActiveId'),
    deviceId: lireChaineOptionnelleDepuisObjet(donnees, 'deviceId'),
  };
}

async function assurerRoleDeveloppeur(
  roleRepository: PostgresRoleRepository,
  actorCode: CodeActeurDeveloppement,
): Promise<Role> {
  const codeRole = actorCode;
  const roleExistant = await roleRepository.trouverParCode(codeRole);
  if (roleExistant !== null) {
    return roleExistant;
  }

  const definition = obtenirDefinitionRoleSysteme(codeRole);
  if (!definition) {
    throw new Error(`Le rôle système ${codeRole} n'est pas défini dans le catalogue officiel.`);
  }
  const role = Role.creer({
    codeRole,
    nomRole: definition.libelle,
    niveauAcces: definition.niveau,
    estSysteme: true,
    creePar: 'dev-session',
    permissions: [...definition.permissions],
  });
  await roleRepository.sauvegarder(role);
  return role;
}

async function assurerUtilisateurDeveloppeur(
  depotUtilisateurAuth: PostgresUtilisateurAuthRepository,
  actorCode: CodeActeurDeveloppement,
): Promise<UtilisateurAuth> {
  const email = `dev.${actorCode.toLowerCase()}@educsync.local`;
  const utilisateurExistant = await depotUtilisateurAuth.trouverParEmail(email);
  if (utilisateurExistant !== null) {
    let doitSauvegarder = false;
    if (utilisateurExistant.obtenirEtatCompte() !== 'ACTIVE') {
      utilisateurExistant.activerCompte();
      doitSauvegarder = true;
    }
    if (!verifierMotDePasseSynchrone(
      MOT_DE_PASSE_SESSION_DEV,
      utilisateurExistant.obtenirMotDePasseHash().obtenirValeur(),
    )) {
      utilisateurExistant.changerMotDePasse(
        hacherMotDePasseSynchrone(MOT_DE_PASSE_SESSION_DEV),
      );
      doitSauvegarder = true;
    }
    if (doitSauvegarder) {
      await depotUtilisateurAuth.sauvegarder(utilisateurExistant);
    }
    return utilisateurExistant;
  }

  const profil = profilsSessionDeveloppeur[actorCode];
  const utilisateur = UtilisateurAuth.creer({
    idUtilisateur: construireIdUtilisateurDeveloppeur(actorCode),
    nomComplet: profil.nomComplet,
    email,
    motDePasseHash: hacherMotDePasseSynchrone(MOT_DE_PASSE_SESSION_DEV),
    authOfflineAutorisee: true,
  });
  try {
    await depotUtilisateurAuth.sauvegarder(utilisateur);
    return utilisateur;
  } catch (erreur) {
    // Un bootstrap concurrent peut avoir cree le meme compte deterministe.
    const creeParConcurrent = await depotUtilisateurAuth.trouverParEmail(email);
    if (creeParConcurrent) {
      return creeParConcurrent;
    }
    throw erreur;
  }
}

async function assurerAffectationDeveloppeur(
  affectationUtilisateurRepository: PostgresAffectationUtilisateurRepository,
  utilisateur: UtilisateurAuth,
  role: Role,
  params: RequeteSessionDeveloppeur,
): Promise<void> {
  const organisationId = params.organisationActiveId ?? ORGANISATION_DEV_PAR_DEFAUT;
  const ecoleId = params.ecoleActiveId ?? ECOLE_DEV_PAR_DEFAUT;
  const niveauAcces = role.obtenirNiveauAcces().obtenirValeur();
  const organisationAffectee = niveauAcces === 'PLATEFORME' ? undefined : organisationId;
  const ecoleAffectee = niveauAcces === 'ECOLE' ? ecoleId : undefined;
  const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(
    utilisateur.obtenirId(),
  );
  const affectationExistante = affectations.find((affectation) =>
    affectation.obtenirIdRole() === role.obtenirId()
    && affectation.obtenirIdOrganisation() === organisationAffectee
    && affectation.obtenirIdEcole() === ecoleAffectee,
  );

  if (affectationExistante) {
    return;
  }

  const affectation = AffectationUtilisateur.creer({
    idUtilisateur: utilisateur.obtenirId(),
    idRole: role.obtenirId(),
    niveauAcces,
    idOrganisation: organisationAffectee,
    idEcole: ecoleAffectee,
    creePar: 'dev-session',
  });

  if (niveauAcces === 'PLATEFORME') {
    affectation.ajouterScope('PLATEFORME', 'system');
  }

  if (organisationAffectee) {
    affectation.ajouterScope('ORGANISATION', organisationAffectee);
  }
  if (ecoleAffectee) {
    affectation.ajouterScope('ECOLE', ecoleAffectee);
  }
  await affectationUtilisateurRepository.sauvegarder(affectation);
}

type PluginRoutesAuth = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

export const routeAuth: PluginRoutesAuth = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesAuth();
    const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
    const depotSessionUtilisateur = new PostgresSessionUtilisateurRepository();
    const affectationUtilisateurRepository = new PostgresAffectationUtilisateurRepository();
    const roleRepository = new PostgresRoleRepository();

    await restaurerAffectationManagerInitial(
      roleRepository,
      affectationUtilisateurRepository,
    );

    await serveur.register(creerRoutesAuth(composition.dependancesRoutes), {
      prefix: routeAuth.prefixe,
    });

    serveur.get('/api/auth/initialisation', async (_requete, reponse) => {
      try {
        return reponse.code(200).send({
          initialisationRequise: await initialisationPlateformeRequise(),
        });
      } catch {
        return reponse.code(503).send({
          code: 'INITIALISATION_STATUS_UNAVAILABLE',
          message: "L'etat de demarrage d'EduSync ne peut pas etre verifie pour le moment.",
        });
      }
    });

    serveur.post('/api/auth/initialisation', async (requete, reponse) => {
      try {
        const payload = lireRequeteInitialisationPlateforme(requete.body);
        const clientSql = obtenirClientPostgresAuth();
        const utilisateurCreeId = await clientSql.dansTransaction(async () => {
          await clientSql.executer(
            "SELECT pg_advisory_xact_lock(hashtext('educsync_auth_platform_bootstrap'))",
          );
          if (!(await initialisationPlateformeRequise())) {
            throw new InitialisationPlateformeFermeeError();
          }

          const utilisateur = UtilisateurAuth.creer({
            nomComplet: [payload.nom, payload.postnom, payload.prenom].join(' '),
            email: payload.email,
            motDePasseHash: hacherMotDePasseSynchrone(payload.motDePasse),
            authOfflineAutorisee: false,
          });
          await depotUtilisateurAuth.sauvegarder(utilisateur);
          await clientSql.executer(
            `INSERT INTO auth_initialisation_plateforme
              (singleton, premier_utilisateur_id, initialise_le, version)
             VALUES (TRUE, $1, NOW(), 1)`,
            [utilisateur.obtenirId()],
          );
          return utilisateur.obtenirId();
        });
        await assurerAffectationManagerPlateforme(
          utilisateurCreeId,
          roleRepository,
          affectationUtilisateurRepository,
        );
        const login = await composition.loginUseCase.executer({
          email: payload.email,
          motDePasse: payload.motDePasse,
          deviceId: payload.deviceId,
          userAgent: typeof requete.headers['user-agent'] === 'string'
            ? requete.headers['user-agent']
            : undefined,
          adresseIp: requete.ip,
        });
        appliquerCookiesInitialisation(
          reponse,
          login as unknown as Record<string, unknown>,
          payload.seSouvenirDeMoi === true,
        );
        return reponse.code(201).send(
          masquerRefreshToken(login as unknown as Record<string, unknown>),
        );
      } catch (erreur) {
        if (erreur instanceof InitialisationPlateformeFermeeError) {
          return reponse.code(409).send({
            code: 'INITIALISATION_ALREADY_COMPLETED',
            message: 'La premiere initialisation EduSync est deja terminee.',
          });
        }
        const message = erreur instanceof Error ? erreur.message : 'Les informations fournies sont invalides.';
        const estValidation = /obligatoire|mot de passe|confirmation|adresse email|email/i.test(message);
        return reponse.code(estValidation ? 400 : 500).send({
          code: estValidation ? 'INITIALISATION_INVALID' : 'INITIALISATION_FAILED',
          message: estValidation
            ? message
            : "La premiere initialisation n'a pas pu etre finalisee.",
        });
      }
    });

    serveur.get('/api/auth/profil', async (requete, reponse) => {
      const contexte = requete.context;
      const utilisateurId = contexte?.utilisateurId;
      const sessionId = contexte?.sessionId;
      if (!utilisateurId || !sessionId) {
        return reponse.code(401).send({
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Une authentification est requise.',
        });
      }

      const [utilisateur, session, modules] = await Promise.all([
        depotUtilisateurAuth.trouverParId(utilisateurId),
        depotSessionUtilisateur.trouverSessionActive(sessionId),
        moduleActivationConfigurationService.resoudreModulesPourContexte({
          organisationId: contexte.organisationActiveId,
          ecoleId: contexte.ecoleActiveId,
        }),
      ]);
      if (!utilisateur || !session) {
        return reponse.code(401).send({
          code: 'AUTHENTICATION_REQUIRED',
          message: 'La session authentifiee n est plus active.',
        });
      }

      const acteurCodeActif = contexte.roleActif;
      const actorCodes = contexte.actorCodes ?? [];
      if (!acteurCodeActif || !actorCodes.includes(acteurCodeActif)) {
        return reponse.code(403).send({
          code: 'ACTIVE_PROFILE_UNAVAILABLE',
          message: "Aucun profil de travail actif n'est disponible pour ce compte.",
        });
      }

      const scopes = contexte.scopes.map((scope) => ({
        typeScope: scope.obtenirTypeScope().obtenirValeur(),
        valeurScope: scope.obtenirValeurScope(),
        estLectureSeule: scope.obtenirEstLectureSeule(),
      }));
      const titulariatsActifs = contexte.titulariats.map((titulariat) => ({
        idAffectationTitulariat: titulariat.obtenirId(),
        idUtilisateur: titulariat.obtenirIdUtilisateur(),
        idOrganisation: titulariat.obtenirIdOrganisation(),
        idEcole: titulariat.obtenirIdEcole(),
        idClasse: titulariat.obtenirIdClasse(),
        idAnneeScolaire: titulariat.obtenirIdAnneeScolaire(),
        estActif: titulariat.obtenirEstActif(),
      }));
      const etatCompte = utilisateur.obtenirEtatCompte();

      return reponse.code(200).send({
        versionContrat: 1,
        session: {
          id: session.obtenirId(),
          etat: 'ACTIVE',
          modeOffline: session.obtenirEstOffline(),
        },
        compte: {
          idUtilisateur: utilisateur.obtenirId(),
          nomComplet: utilisateur.obtenirNomComplet(),
          email: utilisateur.obtenirEmail().obtenirValeur(),
          etat: etatCompte,
          actif: etatCompte === 'ACTIVE',
        },
        contexte: {
          governanceLevel: modules.niveau,
          organisationId: contexte.organisationActiveId ?? null,
          ecoleId: contexte.ecoleActiveId ?? null,
          anneeScolaireId: null,
        },
        actorCodes,
        acteurCodeActif,
        permissionsEffectives: [...contexte.permissions],
        scopes,
        restrictions: [...contexte.restrictions],
        modulesDisponibles: [...modules.modulesDisponibles],
        modulesEffectifs: [...modules.modulesEffectifs],
        titulariatsActifs,
        titulariatsEffectifs: (contexte.titulariatsEffectifs ?? []).map((titulariat) => ({
          ...titulariat,
        })),
        estTitulaireEffectif: contexte.estTitulaireEffectif === true,
        sourceTitulariatEffectif: contexte.sourceTitulariatEffectif ?? 'AUCUNE',
        ownership: {
          elevesAutorises: [...(contexte.elevesAutorises ?? [])],
        },
        // Compatibilite du client existant pendant l'adoption du contrat versionne.
        acteurCode: acteurCodeActif,
        permissions: [...contexte.permissions],
      });
    });

    serveur.put('/api/auth/contexte/plateforme-active', async (requete, reponse) => {
      const contexte = requete.context;
      if (!contexte?.utilisateurId || !contexte.sessionId) {
        return reponse.code(401).send({
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Une authentification est requise.',
        });
      }
      const portePlateforme = contexte.scopes.some(
        (scope) => scope.obtenirTypeScope().obtenirValeur() === 'PLATEFORME',
      );
      if (!portePlateforme) {
        return reponse.code(403).send({
          code: 'SCOPE_DENIED',
          message: "Ce compte ne dispose pas d'un périmètre plateforme.",
        });
      }

      const resultat = await composition.activerContextePlateforme(
        contexte.sessionId,
        contexte.utilisateurId,
      );
      return reponse.code(200).send(resultat);
    });

    if (sessionDeveloppeurDisponible(configurationApplication.environnement)) {
      serveur.post('/api/auth/dev/session', async (requete, reponse) => {
        try {
          const payload = lireRequeteSessionDeveloppeur(requete.body);
          const utilisateur = await assurerUtilisateurDeveloppeur(
            depotUtilisateurAuth,
            payload.actorCode,
          );
          const role = await assurerRoleDeveloppeur(roleRepository, payload.actorCode);
          await assurerAffectationDeveloppeur(
            affectationUtilisateurRepository,
            utilisateur,
            role,
            payload,
          );

          const login = await composition.loginUseCase.executer({
            email: utilisateur.obtenirEmail().obtenirValeur(),
            motDePasse: MOT_DE_PASSE_SESSION_DEV,
            organisationActiveId: profilsSessionDeveloppeur[payload.actorCode].niveauAcces === 'PLATEFORME'
              ? undefined
              : payload.organisationActiveId ?? ORGANISATION_DEV_PAR_DEFAUT,
            ecoleActiveId: profilsSessionDeveloppeur[payload.actorCode].niveauAcces === 'ECOLE'
              ? payload.ecoleActiveId ?? ECOLE_DEV_PAR_DEFAUT
              : undefined,
            deviceId: payload.deviceId,
          });

          appliquerCookiesInitialisation(
            reponse,
            login as unknown as Record<string, unknown>,
            false,
          );

          return reponse.code(200).send(
            masquerRefreshToken(login as unknown as Record<string, unknown>),
          );
        } catch (erreur) {
          serveur.log.warn(
            {
              erreur: erreur instanceof Error ? erreur.message : 'dev_session_failed',
              cause: erreur instanceof Error && erreur.cause instanceof Error
                ? erreur.cause.message
                : undefined,
            },
            'Echec ouverture session developpeur.',
          );
          return reponse.code(400).send({
            success: false,
            message: erreur instanceof Error
              ? erreur.message
              : 'Impossible d ouvrir la session developpeur.',
          });
        }
      });
    }

    serveur.log.info(
      {
        contexte: {
          bc: 'shared-auth',
          prefixe: routeAuth.prefixe,
        },
      },
      'Routes AUTH enregistrees.',
    );
  },
  {
    nom: 'auth',
    prefixe: '/api',
  },
);
