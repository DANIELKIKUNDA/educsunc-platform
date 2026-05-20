// Ce module centralise les cles de cache techniques utilisees par SECURITY.
export const SecurityCacheKeys = {
  permissions: (idUtilisateur: string) => `permissions:${idUtilisateur}`,
  roles: (idUtilisateur: string) => `roles:${idUtilisateur}`,
  scopes: (idUtilisateur: string) => `scopes:${idUtilisateur}`,
  titulariats: (idUtilisateur: string) => `titulariats:${idUtilisateur}`,
  contexte: (idUtilisateur: string) => `context:${idUtilisateur}`,
} as const;
