import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import {
  CONTEXT_ROLE_PAR_DEFAUT,
  RequestContextFactory,
  REQUEST_CONTEXT_HEADER_ORGANISATION,
  REQUEST_CONTEXT_HEADER_SESSION,
  REQUEST_CONTEXT_HEADER_TENANT,
} from 'shared/context';
import { PolicyTokenVersion } from 'shared/auth/domain';
import { AuthenticationMiddleware, JwtTokenAdapter, PostgresContexteActifAuthRepository, PostgresRefreshTokenRepository, PostgresSessionUtilisateurRepository, PostgresUtilisateurAuthRepository, SessionCacheService } from 'shared/auth/infrastructure';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import type { DepotContexteActifAuth, DepotUtilisateurAuth } from 'shared/auth/domain';
import { configurationApplication } from '../../config/app.config';
import { HttpRouteAuthenticationPolicy } from '../security/HttpRouteAuthenticationPolicy';

type PluginGlobal = FastifyPluginAsync & { nom: string };

const jwtTokenAdapter = new JwtTokenAdapter();
const utilisateurAuthRepository = new PostgresUtilisateurAuthRepository();
const sessionUtilisateurRepository = new PostgresSessionUtilisateurRepository();
const refreshTokenRepository = new PostgresRefreshTokenRepository();
const contexteActifAuthRepository = new PostgresContexteActifAuthRepository();
const sessionCacheService = new SessionCacheService();
const sessionApplicationService = new SessionApplicationService(
  sessionUtilisateurRepository,
  refreshTokenRepository,
  sessionCacheService,
);

export interface DependancesAuthenticationPlugin {
  jwtTokenAdapter: JwtTokenAdapter;
  utilisateurAuthRepository: DepotUtilisateurAuth;
  contexteActifAuthRepository: DepotContexteActifAuth;
  sessionApplicationService: SessionApplicationService;
  environment?: string;
}

const dependancesParDefaut: DependancesAuthenticationPlugin = {
  jwtTokenAdapter,
  utilisateurAuthRepository,
  contexteActifAuthRepository,
  sessionApplicationService,
};

// Ce plugin enrichit le RequestContext avec l identite et la session AUTH.
export function creerAuthenticationPlugin(
  dependances: DependancesAuthenticationPlugin = dependancesParDefaut,
): PluginGlobal {
  const authenticationMiddleware = new AuthenticationMiddleware(dependances.jwtTokenAdapter);
  const routePolicy = new HttpRouteAuthenticationPolicy(
    dependances.environment ?? configurationApplication.environnement,
  );
  return Object.assign(
    async (serveur: Parameters<FastifyPluginAsync>[0]) => {
      serveur.addHook('onRequest', async (requete: FastifyRequest, reponse: FastifyReply) => {
      if (routePolicy.isPublic({ method: requete.method, url: requete.url })) {
        return;
      }

      try {
        const payload = await authenticationMiddleware.authentifier(
          typeof requete.headers.authorization === 'string'
            ? requete.headers.authorization
            : undefined,
        );

        if (!payload || typeof payload.sub !== 'string') {
          throw new HttpAuthenticationError(
            'AUTHENTICATION_REQUIRED',
            'Une authentification est requise pour acceder a cette ressource.',
            401,
          );
        }
        if (!requete.context) {
          throw new Error("Le contexte de requete n'est pas initialise.");
        }

        const utilisateur = await dependances.utilisateurAuthRepository.trouverParId(payload.sub);
        if (!utilisateur) {
          throw new HttpAuthenticationError(
            'AUTHENTICATION_INVALID',
            "L'utilisateur authentifie est introuvable.",
            401,
          );
        }

        utilisateur.verifierConnexionAutorisee();
        const tokenVersion = lireValeurNombre(payload.tokenVersion);
        if (typeof tokenVersion !== 'number') {
          throw new HttpAuthenticationError('AUTHENTICATION_INVALID', 'Version de jeton absente.', 401);
        }
        PolicyTokenVersion.verifier(
          utilisateur.obtenirTokenVersion().obtenirValeur(),
          tokenVersion,
        );

        const sessionIdJeton = lireValeurChaine(payload.sid);
        if (!sessionIdJeton) {
          throw new HttpAuthenticationError('AUTHENTICATION_INVALID', 'Session absente du jeton.', 401);
        }
        const sessionIdHeader = lireHeaderChaine(requete.headers, REQUEST_CONTEXT_HEADER_SESSION);
        if (sessionIdHeader && sessionIdHeader !== sessionIdJeton) {
          throw new HttpAuthenticationError(
            'AUTHENTICATION_INVALID',
            'La session transmise ne correspond pas au jeton.',
            401,
          );
        }
        const sessionId = sessionIdHeader ?? sessionIdJeton;
        const session = await dependances.sessionApplicationService.obtenirSessionActive(sessionId);
        if (session.utilisateurId !== utilisateur.obtenirId()) {
          throw new HttpAuthenticationError(
            'AUTHENTICATION_INVALID',
            'La session ne correspond pas a l utilisateur authentifie.',
            401,
          );
        }
        // Le contexte appartient a la session courante. Le contexte historique
        // par utilisateur ne doit jamais contaminer un autre appareil.
        const organisationActiveId = session.organisationActiveId;
        const ecoleActiveId = session.ecoleActiveId;
        const roleActifContexte =
          requete.context.roleActif === CONTEXT_ROLE_PAR_DEFAUT
            ? undefined
            : requete.context.roleActif;
        const roleActif =
          lireValeurChaine(payload.roleActif)
          ?? lireValeurChaine(payload.role)
          ?? roleActifContexte;
        const lectureOrganisationnellePlateforme =
          lireHeaderChaine(requete.headers, 'x-lecture-organisation') === 'true'
          && roleActif !== undefined
          && ['MANAGER_SYSTEME', 'OPERATEUR_SYSTEME', 'SUPPORT_SYSTEME'].includes(roleActif);

        verifierEnTeteIdentite(requete.headers, utilisateur.obtenirId());
        if (!lectureOrganisationnellePlateforme) {
          verifierEnTeteContexte(
            requete.headers,
            REQUEST_CONTEXT_HEADER_ORGANISATION,
            organisationActiveId,
          );
        }
        verifierEnTeteContexte(
          requete.headers,
          REQUEST_CONTEXT_HEADER_TENANT,
          ecoleActiveId,
        );

        requete.context = RequestContextFactory.enrichirAuth(requete.context, {
          utilisateurId: utilisateur.obtenirId(),
          sessionId: session.sessionId,
          roleActif,
          organisationActiveId,
          ecoleActiveId,
          modeOffline:
            session.estOffline
            ?? lireValeurBooleenne(payload.modeOffline)
            ?? false,
          deviceId:
            lireHeaderChaine(requete.headers, 'x-device-id')
            ?? lireValeurChaine(payload.deviceId)
            ?? requete.context.deviceId,
        });

        propagerHeaderContexte(requete.headers, REQUEST_CONTEXT_HEADER_ORGANISATION, requete.context.organisationActiveId);
        propagerHeaderContexte(requete.headers, REQUEST_CONTEXT_HEADER_TENANT, requete.context.ecoleActiveId);
        propagerHeaderContexte(requete.headers, REQUEST_CONTEXT_HEADER_SESSION, requete.context.sessionId);
      } catch (erreur) {
        serveur.log.warn(
          {
            erreur: erreur instanceof Error ? erreur.message : 'auth_context_enrichment_failed',
            route: requete.url,
          },
          "Echec d'enrichissement AUTH du RequestContext.",
        );
        const erreurHttp = erreur instanceof HttpAuthenticationError ? erreur : undefined;
        return reponse.code(erreurHttp?.statusCode ?? 401).send({
          success: false,
          code: erreurHttp?.code ?? 'AUTHENTICATION_INVALID',
          message: erreurHttp?.publicMessage ?? 'Authentification invalide.',
        });
      }
      });
    },
    {
      nom: 'authentication',
    },
  );
}

class HttpAuthenticationError extends Error {
  public constructor(
    public readonly code: string,
    public readonly publicMessage: string,
    public readonly statusCode: 401 | 403,
  ) {
    super(publicMessage);
    this.name = 'HttpAuthenticationError';
  }
}

export const authenticationPlugin: PluginGlobal = creerAuthenticationPlugin();

function lireHeaderChaine(headers: Record<string, unknown>, nom: string): string | undefined {
  const valeur = headers[nom];
  if (typeof valeur !== 'string') {
    return undefined;
  }

  const propre = valeur.trim();
  return propre === '' ? undefined : propre;
}

function lireValeurChaine(valeur: unknown): string | undefined {
  if (typeof valeur !== 'string') {
    return undefined;
  }

  const propre = valeur.trim();
  return propre === '' ? undefined : propre;
}

function lireValeurBooleenne(valeur: unknown): boolean | undefined {
  return typeof valeur === 'boolean' ? valeur : undefined;
}

function lireValeurNombre(valeur: unknown): number | undefined {
  return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : undefined;
}

function propagerHeaderContexte(
  headers: FastifyRequest['headers'],
  nom: string,
  valeur?: string,
): void {
  if (!valeur || typeof headers[nom] === 'string') {
    return;
  }

  headers[nom] = valeur;
}

function verifierEnTeteIdentite(
  headers: FastifyRequest['headers'],
  utilisateurId: string,
): void {
  const utilisateurIdHeader = lireHeaderChaine(headers, 'x-user-id');
  if (utilisateurIdHeader && utilisateurIdHeader !== utilisateurId) {
    throw new HttpAuthenticationError(
      'IDENTITY_CONTEXT_MISMATCH',
      "L'identite transmise ne correspond pas a la session active.",
      403,
    );
  }

  headers['x-user-id'] = utilisateurId;
}

function verifierEnTeteContexte(
  headers: FastifyRequest['headers'],
  nom: string,
  valeurSession?: string,
): void {
  const valeurHeader = lireHeaderChaine(headers, nom);
  if (valeurHeader && valeurHeader !== valeurSession) {
    throw new HttpAuthenticationError(
      'ACTIVE_CONTEXT_MISMATCH',
      'Le contexte transmis ne correspond pas a la session active.',
      403,
    );
  }
}
