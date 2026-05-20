import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { RequestContextFactory, REQUEST_CONTEXT_HEADER_ORGANISATION, REQUEST_CONTEXT_HEADER_SESSION, REQUEST_CONTEXT_HEADER_TENANT } from 'shared/context';
import { AuthenticationMiddleware, JwtTokenAdapter, PostgresContexteActifAuthRepository, PostgresRefreshTokenRepository, PostgresSessionUtilisateurRepository, PostgresUtilisateurAuthRepository, SessionCacheService } from 'shared/auth/infrastructure';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';

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
const authenticationMiddleware = new AuthenticationMiddleware(jwtTokenAdapter);

// Ce plugin enrichit le RequestContext avec l identite et la session AUTH.
export const authenticationPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('onRequest', async (requete: FastifyRequest, reponse: FastifyReply) => {
      try {
        const payload = await authenticationMiddleware.authentifier(
          typeof requete.headers.authorization === 'string'
            ? requete.headers.authorization
            : undefined,
        );

        if (!payload || typeof payload.sub !== 'string' || !requete.context) {
          return;
        }

        const utilisateur = await utilisateurAuthRepository.trouverParId(payload.sub);
        if (!utilisateur) {
          throw new Error("L'utilisateur authentifie est introuvable.");
        }

        utilisateur.verifierConnexionAutorisee();

        const sessionId = lireHeaderChaine(requete.headers, REQUEST_CONTEXT_HEADER_SESSION);
        const session = sessionId
          ? await sessionApplicationService.obtenirSessionActive(sessionId)
          : null;
        const contexteActif = await contexteActifAuthRepository.trouverContexteUtilisateur(
          utilisateur.obtenirId(),
        );

        requete.context = RequestContextFactory.enrichirAuth(requete.context, {
          utilisateurId: utilisateur.obtenirId(),
          sessionId: session?.sessionId ?? sessionId,
          roleActif:
            lireValeurChaine(payload.roleActif)
            ?? lireValeurChaine(payload.role)
            ?? requete.context.roleActif,
          organisationActiveId:
            session?.organisationActiveId
            ?? contexteActif?.obtenirOrganisationActiveId()
            ?? lireValeurChaine(payload.organisationActiveId),
          ecoleActiveId:
            session?.ecoleActiveId
            ?? contexteActif?.obtenirEcoleActiveId()
            ?? lireValeurChaine(payload.ecoleActiveId),
          modeOffline:
            session?.estOffline
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
        return reponse.code(401).send({
          success: false,
          message: 'Authentification invalide.',
        });
      }
    });
  },
  {
    nom: 'authentication',
  },
);

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
