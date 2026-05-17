// Ce port abstrait la journalisation applicative des operations sensibles du BC.
export interface AuditPort {
  journaliser(input: AuditBulletinInput): Promise<void>;
}

export interface AuditBulletinInput {
  action: string;
  idEcole: string;
  idUtilisateur?: string;
  referenceMetier: string;
  details?: Record<string, unknown>;
}
