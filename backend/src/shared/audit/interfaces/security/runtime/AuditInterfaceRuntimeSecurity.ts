import type { AuditInterfaceRuntimeSecurityPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceRuntimeSecurity {
  public static creer(): AuditInterfaceRuntimeSecurityPolicy {
    return {
      protegerAppendOnly: true,
      interdireMutationHistorique: true,
      surveillerStorms: true,
      exigerScopesGranulaires: true,
    };
  }
}

