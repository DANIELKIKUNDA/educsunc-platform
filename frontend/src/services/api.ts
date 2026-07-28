import { lireEntetesAuthentificationActive } from '../shared/session/api-context';
import { recoverAuthentication } from '../shared/auth/auth-recovery';
import {
  frontendLifecycle,
} from '../shared/lifecycle/frontend-lifecycle.runtime';
import type {
  FrontendRequestScope,
} from '../shared/lifecycle/frontend-lifecycle.coordinator';

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
  authRecovery?: boolean;
  signal?: AbortSignal;
  cache?: RequestCache;
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
  if (status === 429) return 'Trop de tentatives ont ete effectuees. Patientez avant de reessayer.';
  if (status >= 500) return 'Le serveur est momentanement indisponible.';
  return 'Une action demandee n a pas pu etre terminee.';
}

function creerErreurAnnulation(): ApiError {
  return new ApiError(
    'La demande a ete interrompue car le contexte actif a change.',
    0,
    'REQUEST_CANCELLED',
  );
}

function verifierRequeteCourante(scope: FrontendRequestScope): void {
  if (!scope.isCurrent()) {
    throw creerErreurAnnulation();
  }
}

// Centralise les appels HTTP du frontend.
export const clientApi = {
  baseUrl,

  async envoyer<TSortie>(requete: RequeteApi): Promise<TSortie> {
    return envoyerAvecReprise<TSortie>(requete, false);
  },
};

async function envoyerAvecReprise<TSortie>(requete: RequeteApi, dejaRejouee: boolean): Promise<TSortie> {
  const requestScope = frontendLifecycle.createRequestScope(requete.signal);

  try {
    let reponse: Response;

    try {
      reponse = await fetch(`${baseUrl}${requete.chemin}`, {
        method: requete.methode ?? 'GET',
        cache: requete.cache ?? ((requete.methode ?? 'GET') === 'GET' ? 'no-store' : 'default'),
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          ...(requete.corps === undefined ? {} : { 'Content-Type': 'application/json' }),
          ...lireEntetesAuthentificationActive(),
          ...requete.entetes,
        },
        body: requete.corps === undefined ? undefined : JSON.stringify(requete.corps),
        signal: requestScope.signal,
      });
    } catch {
      if (!requestScope.isCurrent() || requestScope.signal.aborted) {
        throw creerErreurAnnulation();
      }
      throw new ApiError('Connexion au serveur perdue.', 0, 'NETWORK_ERROR');
    }

    verifierRequeteCourante(requestScope);

    if (!reponse.ok) {
      if (
        reponse.status === 401
        && requete.authRecovery !== false
        && !dejaRejouee
        && await recoverAuthentication()
      ) {
        // La restauration de session invalide volontairement l'ancien cycle.
        // La reprise repart donc avec un nouveau scope au lieu de reutiliser la requete 401.
        return envoyerAvecReprise<TSortie>(requete, true);
      }

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

      verifierRequeteCourante(requestScope);
      const code = extraireCodeBackend(payload) ?? reponse.statusText;
      const message = extraireMessageBackend(payload) ?? messageHttpParDefaut(reponse.status);
      throw new ApiError(message, reponse.status, code, payload);
    }

    if (reponse.status === 204) {
      verifierRequeteCourante(requestScope);
      return undefined as TSortie;
    }
    const payload = (await reponse.json()) as TSortie;
    verifierRequeteCourante(requestScope);
    return payload;
  } finally {
    requestScope.release();
  }
}
