import type { AuditSecurityIncident } from '../SecurityTypes';

// Le hardening réduit les surfaces d attaque et refuse les payloads douteux.
export class AuditHardeningService {
  public validerPayload(payload: Record<string, unknown>): AuditSecurityIncident[] {
    const incidents: AuditSecurityIncident[] = [];
    if ('__proto__' in payload) {
      incidents.push({
        code: 'PAYLOAD_PROTO_POLLUTION',
        message: 'Payload worker suspect contenant __proto__.',
        severite: 'CRITIQUE',
      });
    }
    if (Object.keys(payload).length > 200) {
      incidents.push({
        code: 'PAYLOAD_OVERSIZED',
        message: 'Payload runtime excessivement large.',
        severite: 'AVERTISSEMENT',
      });
    }
    return incidents;
  }
}
