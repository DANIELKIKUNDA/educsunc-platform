import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { AuthErrorPresenter } from '../presenters/AuthErrorPresenter';
import { AccessTokenCookie } from '../cookies/AccessTokenCookie';
import { RefreshTokenCookie } from '../cookies/RefreshTokenCookie';
import type { DependancesRoutesAuth } from './DependancesRoutesAuth';
import { chargerConfigurationAuth } from '../../../../../config/auth.config';
import { configurationApplication } from '../../../../../config/app.config';

interface FastifyRequestAuthEnrichie extends FastifyRequest {
  authUtilisateur?: Record<string, unknown> | null;
}

const DUREE_COOKIE_PERSISTANT_SECONDES = 10 * 365 * 24 * 60 * 60;

function lireSouvenirDeMoi(corps: unknown): boolean {
  return typeof corps === 'object' && corps !== null
    && (corps as Record<string, unknown>).seSouvenirDeMoi === true;
}

function serialiserCookie(
  nom: string,
  valeur: string,
  options?: { maxAge?: number; supprimer?: boolean },
): string {
  const secure = configurationApplication.environnement === 'production' ? '; Secure' : '';
  const maxAge = options?.supprimer
    ? '; Max-Age=0'
    : typeof options?.maxAge === 'number'
      ? `; Max-Age=${options.maxAge}`
      : '';
  return `${nom}=${encodeURIComponent(valeur)}; Path=/; HttpOnly; SameSite=Strict${maxAge}${secure}`;
}

function appliquerCookiesAuth(
  reponse: FastifyReply,
  donnee: Record<string, unknown>,
  seSouvenirDeMoi: boolean,
): void {
  reponse.header('set-cookie', [
    serialiserCookie(
      AccessTokenCookie.NOM,
      String(donnee.accessToken ?? ''),
      { maxAge: chargerConfigurationAuth().dureeAccessTokenSecondes },
    ),
    serialiserCookie(
      RefreshTokenCookie.NOM,
      String(donnee.refreshToken ?? ''),
      seSouvenirDeMoi ? { maxAge: DUREE_COOKIE_PERSISTANT_SECONDES } : undefined,
    ),
  ]);
}

function masquerRefreshToken(donnee: Record<string, unknown>): Record<string, unknown> {
  const { refreshToken: _refreshToken, ...donneePublique } = donnee;
  return donneePublique;
}

// Ce fichier enregistre toutes les routes HTTP exposees par AUTH.
export const creerRoutesAuth = (dependances: DependancesRoutesAuth): FastifyPluginAsync => async (serveur) => {
  const executer = async (
    reponse: FastifyReply,
    operation: () => Promise<{ donnee: unknown }>,
    statutSucces = 200,
  ): Promise<FastifyReply> => {
    try {
      const resultat = await operation();
      return reponse.code(statutSucces).send(resultat.donnee);
    } catch (erreur) {
      const erreurPresentee = AuthErrorPresenter.presenterErreur(erreur);
      return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
    }
  };

  serveur.post('/auth/login', (requete, reponse) =>
    executer(reponse, async () => {
      dependances.rateLimitMiddleware.verifier(`login:${requete.ip}`, 5, 60_000);
      const resultat = await dependances.loginController.login(requete.body, requete.headers);
      const donnee = resultat.donnee as Record<string, unknown>;
      appliquerCookiesAuth(reponse, donnee, lireSouvenirDeMoi(requete.body));
      return { donnee: masquerRefreshToken(donnee) };
    }, 200));

  serveur.post('/auth/logout', (requete, reponse) =>
    executer(reponse, async () => {
      const payload = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, payload, requete.body);
      const resultat = await dependances.logoutController.logout(requete.body, requete.headers);
      reponse.header('set-cookie', [
        serialiserCookie(AccessTokenCookie.NOM, '', { supprimer: true }),
        serialiserCookie(RefreshTokenCookie.NOM, '', { supprimer: true }),
      ]);
      return resultat;
    }));

  serveur.post('/auth/refresh', (requete, reponse) =>
    executer(reponse, async () => {
      dependances.rateLimitMiddleware.verifier(`refresh:${requete.ip}`, 10, 60_000);
      const resultat = await dependances.refreshTokenController.rafraichir(
        requete.body,
        (requete as FastifyRequest & { cookies?: unknown }).cookies,
        requete.headers,
      );
      const donnee = resultat.donnee as Record<string, unknown>;
      appliquerCookiesAuth(reponse, donnee, lireSouvenirDeMoi(requete.body));
      return { donnee: masquerRefreshToken(donnee) };
    }));

  serveur.get('/auth/session', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, requeteAuth.authUtilisateur ?? null);
      return dependances.sessionUtilisateurController.obtenirSession(requete.headers);
    }));

  serveur.get('/auth/contexte', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, requeteAuth.authUtilisateur ?? null);
      await dependances.tenantMiddleware.verifier(requete.headers);
      return dependances.sessionUtilisateurController.obtenirContexte(requete.headers, requeteAuth.authUtilisateur ?? null);
    }));

  serveur.put('/auth/contexte/organisation-active', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, requeteAuth.authUtilisateur ?? null, requete.body);
      return dependances.changerOrganisationActiveController.changer(requete.body, requete.headers);
    }));

  serveur.put('/auth/contexte/ecole-active', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, requeteAuth.authUtilisateur ?? null, requete.body);
      return dependances.changerEcoleActiveController.changer(requete.body, requete.headers);
    }));

  serveur.post('/auth/revoquer-toutes-sessions', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, requeteAuth.authUtilisateur ?? null, requete.body);
      return dependances.revocationSessionsController.revoquer(requete.headers, requeteAuth.authUtilisateur ?? null);
    }));

  serveur.post('/auth/offline/synchroniser', (requete, reponse) =>
    executer(reponse, async () => {
      const payload = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierCoherence(requete.headers, payload, requete.body);
      const utilisateurId = typeof payload?.sub === 'string' ? payload.sub : undefined;
      await dependances.offlineSyncMiddleware.preparer(requete.headers, utilisateurId);
      return dependances.authOfflineController.synchroniser(requete.body, requete.headers);
    }));
};
