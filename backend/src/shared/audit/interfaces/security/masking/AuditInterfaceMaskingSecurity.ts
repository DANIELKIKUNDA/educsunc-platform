import type { AuditInterfaceMaskingPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceMaskingSecurity {
  public static creer(): AuditInterfaceMaskingPolicy {
    return {
      masquerCorps: false,
      masquerHeaders: ['authorization', 'cookie', 'set-cookie', 'x-api-key'],
      masquerChamps: ['token', 'password', 'secret', 'apiKey', 'refreshToken'],
    };
  }
}

