import type { AuditWorkerSecurityDto } from '../dto';
export class AuditWorkersSecurityInterface {
  public static creer(): AuditWorkerSecurityDto {
    return { authInterne: true, validation: true, tenantIsolation: true, replayProtection: true, retryProtection: true };
  }
}

