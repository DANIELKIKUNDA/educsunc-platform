import { lireEntetesAuthentificationActive } from '../shared/session/api-context';

type MethodeHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface RequeteApi {
  methode?: MethodeHttp;
  chemin: string;
  corps?: unknown;
  entetes?: Record<string, string>;
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function extraireMessageBackend(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidat = payload as Record<string, unknown>;
  const erreurObjet = candidat.error && typeof candidat.error === 'object'
    ? candidat.error as Record<string, unknown>
    : null;
  const valeurs = [
    candidat.message,
    candidat.error,
    candidat.erreur,
    candidat.details,
    erreurObjet?.message,
    erreurObjet?.error,
    erreurObjet?.erreur,
    erreurObjet?.details,
  ];

  for (const valeur of valeurs) {
    if (typeof valeur === 'string' && valeur.trim().length > 0) {
      return valeur.trim();
    }
  }

  return null;
}

function extraireCodeBackend(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const candidat = payload as Record<string, unknown>;
  const erreurObjet = candidat.error && typeof candidat.error === 'object'
    ? candidat.error as Record<string, unknown>
    : null;
  const valeur = candidat.code ?? erreurObjet?.code;
  return typeof valeur === 'string' && valeur.trim().length > 0 ? valeur.trim() : null;
}

function messageHttpParDefaut(status: number): string {
  if (status === 400) return 'La demande envoyee est invalide.';
  if (status === 401) return 'Votre session n est plus valide. Reconnectez le contexte.';
  if (status === 403) return 'Une action demandee n a pas pu etre terminee.';
  if (status === 404) return 'La ressource demandee est introuvable.';
  if (status === 409) return 'Cette operation entre en conflit avec des donnees existantes.';
  if (status === 422) return 'Certaines donnees saisies doivent etre corrigees.';
  if (status >= 500) return 'Le serveur est momentanement indisponible.';
  return 'Une action demandee n a pas pu etre terminee.';
}

// Centralise les appels HTTP du frontend.
export const clientApi = {
  baseUrl,

  async envoyer<TSortie>(requete: RequeteApi): Promise<TSortie> {
    let reponse: Response;

    try {
      reponse = await fetch(`${baseUrl}${requete.chemin}`, {
        method: requete.methode ?? 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...lireEntetesAuthentificationActive(),
          ...requete.entetes,
        },
        body: requete.corps === undefined ? undefined : JSON.stringify(requete.corps),
      });
    } catch {
      throw new ApiError('Connexion au serveur perdue.', 0, 'NETWORK_ERROR');
    }

    if (!reponse.ok) {
      let payload: unknown = null;

      try {
        payload = await reponse.clone().json();
      } catch {
        try {
          payload = await reponse.text();
        } catch {
          payload = null;
        }
      }

      const code = extraireCodeBackend(payload) ?? reponse.statusText;
      const message = extraireMessageBackend(payload) ?? messageHttpParDefaut(reponse.status);
      throw new ApiError(message, reponse.status, code, payload);
    }

    return (await reponse.json()) as TSortie;
  },
};
