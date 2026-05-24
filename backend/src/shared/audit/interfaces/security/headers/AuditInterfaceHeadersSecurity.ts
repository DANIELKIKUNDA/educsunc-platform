import type { AuditInterfaceHeaderPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceHeadersSecurity {
  public static creer(): AuditInterfaceHeaderPolicy {
    return {
      requis: ['x-request-id', 'x-correlation-id'],
      propages: [
        'x-request-id',
        'x-correlation-id',
        'x-organisation-id',
        'x-tenant-id',
        'x-device-id',
      ],
      sensibles: ['authorization', 'cookie', 'set-cookie', 'x-api-key'],
    };
  }
}

