// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface SearchAuditQuery {
  readonly page?: number;
  readonly taillePage?: number;
  readonly action?: string;
  readonly typeAuditPrincipal?: string;
  readonly gravite?: string;
  readonly resultat?: string;
  readonly categorieAudit?: string;
  readonly acteurId?: string;
  readonly ressourceId?: string;
  readonly correlationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}
