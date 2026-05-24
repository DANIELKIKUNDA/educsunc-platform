import type { AuditForensicInvestigationRequestDto } from '../dto';

export class AuditForensicPermissionsInterface {
  public static permissionPour(
    type: AuditForensicInvestigationRequestDto['typeInvestigation'],
  ): string {
    switch (type) {
      case 'INCIDENT':
        return 'forensic.incidents';
      case 'REPLAY':
        return 'forensic.replay';
      case 'SUSPICION':
        return 'forensic.security';
      default:
        return 'forensic.read';
    }
  }
}

