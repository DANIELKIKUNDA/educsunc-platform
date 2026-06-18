export interface AuditFinancierInput {
  action: string;
  idOrganisation?: string;
  idEcole: string;
  idUtilisateur?: string;
  roleActif?: string;
  referenceMetier?: string;
  montant?: number;
  devise?: string;
  ancienEtat?: Record<string, unknown>;
  nouvelEtat?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

export interface AuditPort {
  journaliserActionFinanciere(input: AuditFinancierInput): Promise<void>;
}
