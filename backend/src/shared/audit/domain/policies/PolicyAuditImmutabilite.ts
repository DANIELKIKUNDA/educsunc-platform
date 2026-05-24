import { AuditImmutableViolationException } from '../exceptions';

// Cette policy garantit qu'une entrée audit existante ne change jamais.
export class PolicyAuditImmutabilite {
  public static interdireModification(): never {
    throw new AuditImmutableViolationException("Une entree audit existante ne peut jamais etre modifiee.");
  }
}
