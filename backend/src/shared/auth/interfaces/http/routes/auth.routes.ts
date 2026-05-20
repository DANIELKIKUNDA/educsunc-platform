import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { AuthErrorPresenter } from '../presenters/AuthErrorPresenter';
import { AccessTokenCookie } from '../cookies/AccessTokenCookie';
import { RefreshTokenCookie } from '../cookies/RefreshTokenCookie';
import type { DependancesRoutesAuth } from './DependancesRoutesAuth';

interface FastifyRequestAuthEnrichie extends FastifyRequest {
  authUtilisateur?: Record<string, unknown> | null;
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
      if (typeof donnee.accessToken === 'string') {
        AccessTokenCookie.appliquer(reponse, donnee.accessToken);
      }
      if (typeof donnee.refreshToken === 'string') {
        reponse.header('set-cookie', [
          `${AccessTokenCookie.NOM}=${encodeURIComponent(String(donnee.accessToken ?? ''))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900; Secure`,
          `${RefreshTokenCookie.NOM}=${encodeURIComponent(String(donnee.refreshToken))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Secure`,
        ]);
      }
      return resultat;
    }, 200));

  serveur.post('/auth/logout', (requete, reponse) =>
    executer(reponse, async () => {
      await dependances.sessionMiddleware.verifierSession(requete.headers, requete.body);
      const resultat = await dependances.logoutController.logout(requete.body, requete.headers);
      reponse.header('set-cookie', [
        `${AccessTokenCookie.NOM}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`,
        `${RefreshTokenCookie.NOM}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`,
      ]);
      return resultat;
    }));

  serveur.post('/auth/refresh', (requete, reponse) =>
    executer(reponse, async () => {
      dependances.rateLimitMiddleware.verifier(`refresh:${requete.ip}`, 10, 60_000);
      const resultat = await dependances.refreshTokenController.rafraichir(requete.body, (requete as FastifyRequest & { cookies?: unknown }).cookies);
      const donnee = resultat.donnee as Record<string, unknown>;
      reponse.header('set-cookie', [
        `${AccessTokenCookie.NOM}=${encodeURIComponent(String(donnee.accessToken ?? ''))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900; Secure`,
        `${RefreshTokenCookie.NOM}=${encodeURIComponent(String(donnee.refreshToken ?? ''))}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Secure`,
      ]);
      return resultat;
    }));

  serveur.get('/auth/session', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierSession(requete.headers);
      return dependances.sessionUtilisateurController.obtenirSession(requete.headers);
    }));

  serveur.get('/auth/contexte', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.tenantMiddleware.verifier(requete.headers);
      return dependances.sessionUtilisateurController.obtenirContexte(requete.headers, requeteAuth.authUtilisateur ?? null);
    }));

  serveur.put('/auth/contexte/organisation-active', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierSession(requete.headers, requete.body);
      return dependances.changerOrganisationActiveController.changer(requete.body, requete.headers);
    }));

  serveur.put('/auth/contexte/ecole-active', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierSession(requete.headers, requete.body);
      return dependances.changerEcoleActiveController.changer(requete.body, requete.headers);
    }));

  serveur.post('/auth/revoquer-toutes-sessions', (requete, reponse) =>
    executer(reponse, async () => {
      const requeteAuth = requete as FastifyRequestAuthEnrichie;
      requeteAuth.authUtilisateur = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      await dependances.sessionMiddleware.verifierSession(requete.headers, requete.body);
      return dependances.revocationSessionsController.revoquer(requete.headers, requeteAuth.authUtilisateur ?? null);
    }));

  serveur.post('/auth/offline/synchroniser', (requete, reponse) =>
    executer(reponse, async () => {
      const payload = await dependances.jwtAuthenticationMiddleware.authentifier(requete.headers);
      const utilisateurId = typeof payload?.sub === 'string' ? payload.sub : undefined;
      await dependances.offlineSyncMiddleware.preparer(requete.headers, utilisateurId);
      return dependances.authOfflineController.synchroniser(requete.body, requete.headers);
    }));
};
