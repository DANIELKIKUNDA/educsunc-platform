// Cette commande formalise une demande d'archivage audit au niveau applicatif.
export interface ArchiveAuditCommand {
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly dateLimite?: string;
  readonly motif?: string;
  readonly executePar?: string;
}
