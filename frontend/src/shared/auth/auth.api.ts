import { clientApi } from '../../services/api';

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

export interface BackendDeveloperSessionApiData {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  utilisateur: {
    idUtilisateur: string;
    nomComplet: string;
    email: string;
    etatCompte: string;
  };
  organisationActiveId?: string;
  ecoleActiveId?: string;
  expireLe?: string;
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
  async ouvrirSessionDeveloppeur(params: {
    actorCode: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    deviceId?: string;
  }): Promise<BackendDeveloperSessionApiData> {
    return clientApi.envoyer<BackendDeveloperSessionApiData>({
      chemin: '/api/auth/dev/session',
      methode: 'POST',
      corps: params,
    });
  },

  async obtenirSession(params: {
    accessToken: string;
    sessionId: string;
  }): Promise<BackendSessionApiData> {
    return clientApi.envoyer<BackendSessionApiData>({
      chemin: '/api/auth/session',
      entetes: construireEntetesAuth(params),
    });
  },

  async obtenirContexte(params: {
    accessToken: string;
    sessionId: string;
    utilisateurId?: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer<BackendContexteActifApiData>({
      chemin: '/api/auth/contexte',
      entetes: construireEntetesAuth(params),
    });
  },

  async changerOrganisationActive(params: {
    accessToken: string;
    sessionId: string;
    organisationActiveId: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer<BackendContexteActifApiData>({
      chemin: '/api/auth/contexte/organisation-active',
      methode: 'PUT',
      corps: {
        organisationActiveId: params.organisationActiveId,
      },
      entetes: construireEntetesAuth(params),
    });
  },

  async changerEcoleActive(params: {
    accessToken: string;
    sessionId: string;
    ecoleActiveId: string;
  }): Promise<BackendContexteActifApiData> {
    return clientApi.envoyer<BackendContexteActifApiData>({
      chemin: '/api/auth/contexte/ecole-active',
      methode: 'PUT',
      corps: {
        ecoleActiveId: params.ecoleActiveId,
      },
      entetes: construireEntetesAuth(params),
    });
  },
};
