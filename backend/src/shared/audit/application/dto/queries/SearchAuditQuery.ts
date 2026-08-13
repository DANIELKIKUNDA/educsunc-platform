// Ce DTO de requete regroupe des filtres applicatifs Audit.
export interface SearchAuditQuery {
  readonly page?: number;
  readonly taillePage?: number;
  readonly cursor?: string;
  readonly idAuditEntry?: string;
  readonly action?: string;
  readonly typeAuditPrincipal?: string;
  readonly gravite?: string;
  readonly resultat?: string;
  readonly categorieAudit?: string;
  readonly acteurId?: string;
  readonly ressourceId?: string;
  readonly typeRessource?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly sourceAudit?: string;
  readonly dateDebut?: string;
  readonly dateFin?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly scope?: 'PLATEFORME' | 'ORGANISATION' | 'ECOLE';
  readonly demandeurId?: string;
  readonly raison?: string;
}
