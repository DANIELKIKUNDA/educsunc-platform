import type { FastifyPluginAsync } from 'fastify';
import { AuthOfflineController } from '../controllers/AuthOfflineController';
import { ChangerEcoleActiveController } from '../controllers/ChangerEcoleActiveController';
import { ChangerOrganisationActiveController } from '../controllers/ChangerOrganisationActiveController';
import { LoginController } from '../controllers/LoginController';
import { LogoutController } from '../controllers/LogoutController';
import { RefreshTokenController } from '../controllers/RefreshTokenController';
import { RevocationSessionsController } from '../controllers/RevocationSessionsController';
import { SessionUtilisateurController } from '../controllers/SessionUtilisateurController';
import { JwtAuthenticationMiddleware } from '../middlewares/JwtAuthenticationMiddleware';
import { OfflineSyncMiddleware } from '../middlewares/OfflineSyncMiddleware';
import { RateLimitMiddleware } from '../middlewares/RateLimitMiddleware';
import { SessionMiddleware } from '../middlewares/SessionMiddleware';
import { TenantMiddleware } from '../middlewares/TenantMiddleware';

// Cette interface regroupe tout le necessaire pour brancher les routes AUTH.
export interface DependancesRoutesAuth {
  loginController: LoginController;
  logoutController: LogoutController;
  refreshTokenController: RefreshTokenController;
  changerOrganisationActiveController: ChangerOrganisationActiveController;
  changerEcoleActiveController: ChangerEcoleActiveController;
  sessionUtilisateurController: SessionUtilisateurController;
  revocationSessionsController: RevocationSessionsController;
  authOfflineController: AuthOfflineController;
  jwtAuthenticationMiddleware: JwtAuthenticationMiddleware;
  sessionMiddleware: SessionMiddleware;
  tenantMiddleware: TenantMiddleware;
  offlineSyncMiddleware: OfflineSyncMiddleware;
  rateLimitMiddleware: RateLimitMiddleware;
}

// Ce type documente la signature de creation des routes AUTH.
export type FabriqueRoutesAuth = (dependances: DependancesRoutesAuth) => FastifyPluginAsync;
