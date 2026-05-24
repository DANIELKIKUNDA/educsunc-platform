// Cette classe de base unifie les violations métier du domaine Audit.
export class AuditDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}
