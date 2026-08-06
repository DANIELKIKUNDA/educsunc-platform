import { recoverAuthentication } from '../auth/auth-recovery';
import type { FrontendRequestScope } from '../lifecycle/frontend-lifecycle.coordinator';
import { frontendLifecycle } from '../lifecycle/frontend-lifecycle.runtime';
import { lireEntetesAuthentificationActive } from '../session/api-context';
import { FrontendDataCache } from './frontend-data-cache';

type MethodeHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type FormatReponse = 'json' | 'blob';

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PolitiqueCacheDonnees {
  /** Duree de conservation en memoire. Sans cette option, aucune donnee metier n'est cachee. */
  dureeMs: number;
  /** Cle fonctionnelle facultative lorsque le chemin ne suffit pas a identifier la lecture. */
  cle?: string;
}

export interface RequeteApi {
  methode?: MethodeHttp;
  chemin: string;
  corps?: unknown;
  entetes?: Record<string, string>;
  authRecovery?: boolean;
  signal?: AbortSignal;
  cache?: RequestCache;
  cacheDonnees?: PolitiqueCacheDonnees;
}

export interface FichierApi {
  blob: Blob;
  entetes: Headers;
  status: number;
}

interface ReponseTransport<T> {
  donnees: T;
  entetes: Headers;
  status: number;
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const cacheDonnees = new FrontendDataCache();

frontendLifecycle.registerStore({
  id: 'shared-http-data-cache',
  scope: 'context',
  reset: () => cacheDonnees.vider(),
});

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

function methodeRequete(requete: RequeteApi): MethodeHttp {
  return requete.methode ?? 'GET';
}

function normaliserEntetes(entetes: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entetes).map(([nom, valeur]) => [nom.toLowerCase(), valeur]),
  );
}

function construireEntetes(requete: RequeteApi, format: FormatReponse): Record<string, string> {
  return {
    Accept: format === 'blob' ? 'application/octet-stream' : 'application/json',
    ...(requete.corps === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...lireEntetesAuthentificationActive(),
    ...requete.entetes,
  };
}

function construireCleCache(requete: RequeteApi): string {
  const entetes = normaliserEntetes(construireEntetes(requete, 'json'));
  const contexte = [
    'x-user-id',
    'x-role-actif',
    'x-organisation-id',
    'x-tenant-id',
    'x-ecole-id',
  ].map((nom) => `${nom}:${entetes[nom] ?? ''}`);

  return JSON.stringify([
    frontendLifecycle.revision,
    requete.cacheDonnees?.cle ?? requete.chemin,
    contexte,
  ]);
}

async function lireErreurHttp(reponse: Response): Promise<unknown> {
  try {
    return await reponse.clone().json();
  } catch {
    try {
      return await reponse.text();
    } catch {
      return null;
    }
  }
}

async function envoyerAvecReprise<TSortie>(
  requete: RequeteApi,
  dejaRejouee: boolean,
  format: FormatReponse,
): Promise<ReponseTransport<TSortie>> {
  const requestScope = frontendLifecycle.createRequestScope(requete.signal);

  try {
    let reponse: Response;

    try {
      reponse = await fetch(`${baseUrl}${requete.chemin}`, {
        method: methodeRequete(requete),
        cache: requete.cache ?? (methodeRequete(requete) === 'GET' ? 'no-store' : 'default'),
        credentials: 'include',
        headers: construireEntetes(requete, format),
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
        return envoyerAvecReprise<TSortie>(requete, true, format);
      }

      const payload = await lireErreurHttp(reponse);
      verifierRequeteCourante(requestScope);
      const code = extraireCodeBackend(payload) ?? reponse.statusText;
      const message = extraireMessageBackend(payload) ?? messageHttpParDefaut(reponse.status);
      throw new ApiError(message, reponse.status, code, payload);
    }

    if (reponse.status === 204) {
      verifierRequeteCourante(requestScope);
      return {
        donnees: undefined as TSortie,
        entetes: reponse.headers,
        status: reponse.status,
      };
    }

    const donnees = format === 'blob'
      ? await reponse.blob() as TSortie
      : await reponse.json() as TSortie;
    verifierRequeteCourante(requestScope);
    return { donnees, entetes: reponse.headers, status: reponse.status };
  } finally {
    requestScope.release();
  }
}

// Point d'entree HTTP unique du frontend.
export const clientApi = {
  baseUrl,

  async envoyer<TSortie>(requete: RequeteApi): Promise<TSortie> {
    if (requete.signal?.aborted) {
      throw creerErreurAnnulation();
    }

    const utiliseCache = methodeRequete(requete) === 'GET'
      && Boolean(requete.cacheDonnees && requete.cacheDonnees.dureeMs > 0);
    const cleCache = utiliseCache ? construireCleCache(requete) : null;

    if (cleCache) {
      const lecture = cacheDonnees.lire<TSortie>(cleCache);
      if (lecture.trouvee) {
        return lecture.valeur as TSortie;
      }
    }

    const reponse = await envoyerAvecReprise<TSortie>(requete, false, 'json');
    if (cleCache && requete.cacheDonnees) {
      cacheDonnees.enregistrer(cleCache, reponse.donnees, requete.cacheDonnees.dureeMs);
    } else if (methodeRequete(requete) !== 'GET') {
      cacheDonnees.vider();
    }
    return reponse.donnees;
  },

  async telecharger(requete: RequeteApi): Promise<FichierApi> {
    const reponse = await envoyerAvecReprise<Blob>(requete, false, 'blob');
    return {
      blob: reponse.donnees,
      entetes: reponse.entetes,
      status: reponse.status,
    };
  },

  invaliderCacheDonnees(): void {
    cacheDonnees.vider();
  },
};
