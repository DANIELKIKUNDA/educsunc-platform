type MethodeHttp = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequeteApi {
  methode?: MethodeHttp;
  chemin: string;
  corps?: unknown;
  entetes?: Record<string, string>;
}

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Centralise les appels HTTP du frontend.
export const clientApi = {
  baseUrl,

  async envoyer<TSortie>(requete: RequeteApi): Promise<TSortie> {
    const reponse = await fetch(`${baseUrl}${requete.chemin}`, {
      method: requete.methode ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...requete.entetes,
      },
      body: requete.corps === undefined ? undefined : JSON.stringify(requete.corps),
    });

    if (!reponse.ok) {
      throw new Error('Une action demandee n a pas pu etre terminee.');
    }

    return (await reponse.json()) as TSortie;
  },
};
