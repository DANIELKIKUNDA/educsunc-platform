// Ce port abstrait la journalisation applicative des operations sensibles du BC.
export interface AuditPort {
  journaliser(input: AuditBulletinInput): Promise<void>;
}

export interface AuditBulletinInput {
  action: string;
  idOrganisation?: string;
  idEcole: string;
  idUtilisateur?: string;
  referenceMetier: string;
  operationId?: string;
  details?: Record<string, unknown>;
}
