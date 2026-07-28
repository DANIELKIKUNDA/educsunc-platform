import { clientApi } from '../../services/api';
import type { EffectiveProfilePayloadV1 } from '../permissions/effective-profile.types';

export interface BackendSessionApiData {
  sessionId: string;
  utilisateurId: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
  estOffline: boolean;
}

export interface BackendContexteActifApiData {
  organisationActiveId?: string;
  ecoleActiveId?: string;
}

export interface BackendLoginApiData {
  accessToken: string;
  sessionId: string;
  utilisateur: {
    idUtilisateur: string;
    nomComplet: string;
    email: string;
    etatCompte: string;
  };
  acteurCode?: string;
  permissions?: readonly string[];
  organisationActiveId?: string;
  ecoleActiveId?: string;
}

export interface BackendRefreshApiData {
  accessToken: string;
  sessionId: string;
}

export interface BackendDeveloperSessionApiData extends BackendLoginApiData {
  refreshToken?: string;
}

export interface BackendEffectiveProfileApiData extends EffectiveProfilePayloadV1 {
  versionContrat: 1;
  acteurCodeActif: string;
  actorCodes: readonly string[];
  permissionsEffectives: readonly string[];
}

function construireEntetesAuth(params: {
  accessToken: string;
  sessionId: string;
  utilisateurId?: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
}): Record<string, string> {
  return {
    authorization: `Bearer ${params.accessToken}`,
    'x-session-id': params.sessionId,
    ...(params.utilisateurId ? { 'x-user-id': params.utilisateurId } : {}),
    ...(params.organisationActiveId ? { 'x-organisation-id': params.organisationActiveId } : {}),
    ...(params.ecoleActiveId ? { 'x-tenant-id': params.ecoleActiveId } : {}),
  };
}

export const authApi = {
  async obtenirEtatInitialisation(): Promise<{ initialisationRequise: boolean }> {
    return clientApi.envoyer({
      chemin: '/api/auth/initialisation',
      authRecovery: false,
    });
  },

  async initialiserPlateforme(params: {
    nom: string;
    postnom: string;
    prenom: string;
    email: string;
    motDePasse: string;
    confirmationMotDePasse: string;
    seSouvenirDeMoi: boolean;
    deviceId: string;
  }): Promise<BackendLoginApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/initialisation',
      methode: 'POST',
      corps: params,
      authRecovery: false,
    });
  },

  async connecter(params: {
    email: string;
    motDePasse: string;
    seSouvenirDeMoi: boolean;
    deviceId: string;
  }): Promise<BackendLoginApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/login',
      methode: 'POST',
      corps: params,
      authRecovery: false,
    });
  },

  async rafraichir(params: {
    sessionId: string;
    seSouvenirDeMoi: boolean;
  }): Promise<BackendRefreshApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/refresh',
      methode: 'POST',
      corps: params,
      entetes: { 'x-session-id': params.sessionId },
      authRecovery: false,
    });
  },

  async deconnecter(params: { accessToken: string; sessionId: string }): Promise<{ succes: boolean }> {
    return clientApi.envoyer({
      chemin: '/api/auth/logout',
      methode: 'POST',
      corps: { sessionId: params.sessionId },
      entetes: construireEntetesAuth(params),
      authRecovery: false,
    });
  },

  async ouvrirSessionDeveloppeur(params: {
    actorCode: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    deviceId?: string;
  }): Promise<BackendDeveloperSessionApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/dev/session',
      methode: 'POST',
      corps: params,
      authRecovery: false,
    });
  },

  async obtenirSession(params: { accessToken: string; sessionId: string }): Promise<BackendSessionApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/session',
      entetes: construireEntetesAuth(params),
      authRecovery: false,
    });
  },

  async obtenirProfil(params: {
    accessToken: string;
    sessionId: string;
  }): Promise<BackendEffectiveProfileApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/profil',
      entetes: construireEntetesAuth(params),
      authRecovery: false,
    });
  },

  async obtenirContexte(params: {
    accessToken: string;
    sessionId: string;
    utilisateurId?: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/contexte',
      entetes: construireEntetesAuth(params),
      authRecovery: false,
    });
  },

  async changerOrganisationActive(params: {
    accessToken: string;
    sessionId: string;
    organisationActiveId: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/contexte/organisation-active',
      methode: 'PUT',
      corps: { organisationActiveId: params.organisationActiveId },
      entetes: construireEntetesAuth(params),
    });
  },

  async activerContextePlateforme(params: {
    accessToken: string;
    sessionId: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/contexte/plateforme-active',
      methode: 'PUT',
      entetes: construireEntetesAuth(params),
    });
  },

  async changerEcoleActive(params: {
    accessToken: string;
    sessionId: string;
    ecoleActiveId: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer({
      chemin: '/api/auth/contexte/ecole-active',
      methode: 'PUT',
      corps: { ecoleActiveId: params.ecoleActiveId },
      entetes: construireEntetesAuth(params),
    });
  },
};
