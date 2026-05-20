// Ce helper centralise la lecture du header Authorization.
export class AuthorizationHeaders {
  public static readonly NOM = 'authorization';

  // Cette methode retourne le bearer token s'il est bien present.
  public static extraireBearer(headers: unknown): string | undefined {
    if (typeof headers !== 'object' || headers === null) {
      return undefined;
    }

    const dictionnaire = headers as Record<string, unknown>;
    const brut = dictionnaire[this.NOM] ?? dictionnaire.Authorization;
    if (typeof brut !== 'string') {
      return undefined;
    }

    const valeur = brut.trim();
    if (!valeur.startsWith('Bearer ')) {
      return undefined;
    }

    const token = valeur.slice('Bearer '.length).trim();
    return token === '' ? undefined : token;
  }
}
