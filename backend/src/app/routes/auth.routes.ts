import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
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
import { MoteurAuthentification, MoteurContexteActif, MoteurOfflineAuth, MoteurRefreshToken } from '../../shared/auth/domain';
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
import { UtilisateurAuth } from '../../shared/auth/domain/aggregates/UtilisateurAuth';
import { AffectationUtilisateur, Role } from '../../shared/security/domain';
import { PERMISSIONS_SECURITE } from '../../shared/security/domain/value-objects/PermissionSecurite';

const JWT_SECRET_PAR_DEFAUT = 'dev-secret-change-me';
const MOT_DE_PASSE_SESSION_DEV = 'EducSyn.dev.session.2026';
const ORGANISATION_DEV_PAR_DEFAUT = 'org-edusync-dev';
const ECOLE_DEV_PAR_DEFAUT = 'ecole-edusync-dev';

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
  | 'TITULAIRE'
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
  TITULAIRE: { nomComplet: 'Junior Mbuyi', niveauAcces: 'ECOLE' },
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

function genererJwtSynchrone(payload: Record<string, unknown>): string {
  const corps = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const nonce = randomBytes(16).toString('base64url');
  const signature = createHmac('sha256', JWT_SECRET_PAR_DEFAUT)
    .update(`${corps}.${nonce}`)
    .digest('base64url');
  return `${corps}.${nonce}.${signature}`;
}

function genererRefreshTokenSynchrone(): string {
  return randomBytes(32).toString('hex');
}

function hacherMotDePasseSynchrone(motDePasseClair: string): string {
  const sel = randomBytes(16).toString('hex');
  const hash = scryptSync(String(motDePasseClair || ''), sel, 64, { N: 16384 }).toString('hex');
  return `scrypt:${sel}:${hash}`;
}

function hacherRefreshTokenSynchrone(refreshToken: string): string {
  return createHmac('sha256', JWT_SECRET_PAR_DEFAUT)
    .update(String(refreshToken || ''))
    .digest('hex');
}

function composerRoutesAuth(): CompositionRoutesAuth {
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
        genererJwt: genererJwtSynchrone,
        genererRefreshTokenValue: genererRefreshTokenSynchrone,
        hacherRefreshToken: hacherRefreshTokenSynchrone,
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
      depotUtilisateurAuth,
      new JwtTokenAdapter(JWT_SECRET_PAR_DEFAUT),
      new MoteurRefreshToken({
        genererRefreshTokenValue: genererRefreshTokenSynchrone,
        hacherRefreshToken: hacherRefreshTokenSynchrone,
      }),
      auditAuthApplicationService,
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
    auditAuthApplicationService,
  );
  const authentificationOfflineUseCase = new AuthentificationOfflineUseCase(authApplicationService);

  return {
    loginUseCase,
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
        new AuthenticationMiddleware(new JwtTokenAdapter(JWT_SECRET_PAR_DEFAUT)),
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
  const roleExistant = await roleRepository.trouverParCode(actorCode);
  if (roleExistant !== null) {
    return roleExistant;
  }

  const profil = profilsSessionDeveloppeur[actorCode];
  const role = Role.creer({
    codeRole: actorCode,
    nomRole: profil.nomComplet,
    niveauAcces: profil.niveauAcces,
    estSysteme: true,
    creePar: 'dev-session',
    permissions: [...PERMISSIONS_SECURITE],
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
    utilisateurExistant.activerCompte();
    await depotUtilisateurAuth.sauvegarder(utilisateurExistant);
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
  await depotUtilisateurAuth.sauvegarder(utilisateur);
  return utilisateur;
}

async function assurerAffectationDeveloppeur(
  affectationUtilisateurRepository: PostgresAffectationUtilisateurRepository,
  utilisateur: UtilisateurAuth,
  role: Role,
  params: RequeteSessionDeveloppeur,
): Promise<void> {
  const organisationId = params.organisationActiveId ?? ORGANISATION_DEV_PAR_DEFAUT;
  const ecoleId = params.ecoleActiveId ?? ECOLE_DEV_PAR_DEFAUT;
  const affectations = await affectationUtilisateurRepository.listerActivesParUtilisateur(
    utilisateur.obtenirId(),
  );
  const affectationExistante = affectations.find((affectation) =>
    affectation.obtenirIdRole() === role.obtenirId()
    && affectation.obtenirIdOrganisation() === organisationId
    && affectation.obtenirIdEcole() === ecoleId,
  );

  if (affectationExistante) {
    return;
  }

  const niveauAcces = role.obtenirNiveauAcces().obtenirValeur();
  const affectation = AffectationUtilisateur.creer({
    idUtilisateur: utilisateur.obtenirId(),
    idRole: role.obtenirId(),
    niveauAcces,
    idOrganisation: organisationId,
    idEcole: ecoleId,
    creePar: 'dev-session',
  });

  if (niveauAcces === 'PLATEFORME') {
    affectation.ajouterScope('PLATEFORME', 'system');
  }

  affectation.ajouterScope('ORGANISATION', organisationId);
  affectation.ajouterScope('ECOLE', ecoleId);
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
    const affectationUtilisateurRepository = new PostgresAffectationUtilisateurRepository();
    const roleRepository = new PostgresRoleRepository();

    await serveur.register(creerRoutesAuth(composition.dependancesRoutes), {
      prefix: routeAuth.prefixe,
    });

    serveur.post('/api/auth/dev/session', async (requete, reponse) => {
      if (configurationApplication.environnement !== 'development') {
        return reponse.code(404).send({
          success: false,
          message: 'Route indisponible hors developpement.',
        });
      }

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
          organisationActiveId: payload.organisationActiveId ?? ORGANISATION_DEV_PAR_DEFAUT,
          ecoleActiveId: payload.ecoleActiveId ?? ECOLE_DEV_PAR_DEFAUT,
          deviceId: payload.deviceId,
        });

        return reponse.code(200).send(login);
      } catch (erreur) {
        serveur.log.warn(
          {
            erreur: erreur instanceof Error ? erreur.message : 'dev_session_failed',
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
