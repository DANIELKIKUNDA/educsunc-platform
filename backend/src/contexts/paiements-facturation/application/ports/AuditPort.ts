export interface AuditFinancierInput {
  action: string;
  idEcole: string;
  idUtilisateur?: string;
  referenceMetier?: string;
  details?: Record<string, unknown>;
}

export interface AuditPort {
  journaliserActionFinanciere(input: AuditFinancierInput): Promise<void>;
}
