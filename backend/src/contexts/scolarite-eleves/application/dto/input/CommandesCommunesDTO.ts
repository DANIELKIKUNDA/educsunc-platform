// Ce fichier regroupe les champs communs des commandes applicatives sensibles.
export interface ContexteCommandeScolariteDTO {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idempotencyKey?: string;
  versionAttendue?: number;
}
