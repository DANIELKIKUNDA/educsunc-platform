import { AuditExportSecurityGuard } from '../../exports';
import type { AuditExportRequest } from '../../exports';
import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditExportSecurityService {
  public constructor(
    private readonly guard: AuditExportSecurityGuard = new AuditExportSecurityGuard(),
  ) {}

  public verifier(request: AuditExportRequest): AuditAccessDecision {
    if (!this.guard.autoriser(request)) {
      return { autorise: false, raison: 'Export audit non autorisé.' };
    }
    return this.guard.verifierVolumetrie(request)
      ? { autorise: true, raison: 'Export autorisé.' }
      : { autorise: false, raison: 'Volumétrie export au-dessus du seuil autorisé.' };
  }
}
