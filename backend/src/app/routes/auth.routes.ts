import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
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

const JWT_SECRET_PAR_DEFAUT = 'dev-secret-change-me';

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

type PluginRoutesAuth = FastifyPluginAsync & {
  nom: string;
  prefixe: string;
};

export const routeAuth: PluginRoutesAuth = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    const composition = composerRoutesAuth();

    await serveur.register(creerRoutesAuth(composition.dependancesRoutes), {
      prefix: routeAuth.prefixe,
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
