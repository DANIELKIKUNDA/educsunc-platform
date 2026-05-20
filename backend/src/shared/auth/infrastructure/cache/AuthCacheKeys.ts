// Ce fichier centralise les cles de cache officielles du domaine AUTH.
export class AuthCacheKeys {
  public static utilisateur(idUtilisateur: string): string {
    return `auth:user:${idUtilisateur}`;
  }

  public static session(idSessionUtilisateur: string): string {
    return `auth:session:${idSessionUtilisateur}`;
  }

  public static refresh(idRefreshToken: string): string {
    return `auth:refresh:${idRefreshToken}`;
  }

  public static contexte(idUtilisateur: string): string {
    return `auth:context:${idUtilisateur}`;
  }

  public static offline(utilisateurId: string, deviceId: string): string {
    return `auth:offline:${utilisateurId}:${deviceId}`;
  }
}
