export interface PermissionCachePort {
  memoriserPermissions(idUtilisateur: string, permissions: readonly string[]): Promise<void>;
  obtenirPermissions(idUtilisateur: string): Promise<readonly string[] | null>;
  invaliderPermissions(idUtilisateur: string): Promise<void>;
}
