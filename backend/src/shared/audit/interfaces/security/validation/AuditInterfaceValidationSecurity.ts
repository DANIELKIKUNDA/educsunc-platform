import type { AuditInterfaceValidationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceValidationSecurity {
  public static creer(): AuditInterfaceValidationPolicy {
    return {
      verifierPayload: true,
      verifierHeaders: true,
      verifierQuery: true,
      verifierPathParams: true,
      exigerJson: true,
    };
  }
}

