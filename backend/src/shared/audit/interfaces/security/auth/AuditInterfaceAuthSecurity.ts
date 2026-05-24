import type { RequestContext } from 'shared/context';
import { ValidationError } from 'shared/exceptions/ValidationError';
import type { AuditInterfaceAuthenticationPolicy, AuditSecuritySurface } from '../SecurityInterfaceTypes';

const SENSITIVE_SURFACES: readonly AuditSecuritySurface[] = [
  'FORENSIC',
  'REPLAY',
  'RETRY',
  'SYNCHRONIZATION',
  'EXPORTS',
  'MONITORING',
  'WORKERS',
  'QUEUES',
  'INCIDENTS',
  'ANOMALIES',
  'RETENTION',
  'RUNTIME',
];

export class AuditInterfaceAuthSecurity {
  public static creerPolicy(surface: AuditSecuritySurface): AuditInterfaceAuthenticationPolicy {
    const obligatoire = surface === 'AUTH' || SENSITIVE_SURFACES.includes(surface);
    return {
      obligatoire,
      verifierJwt: obligatoire,
      verifierSession: obligatoire,
      verifierRevocation: obligatoire,
      verifierContexteActif: obligatoire,
      verifierEtatCompte: obligatoire,
      verifierTenantActif: surface !== 'AUTH',
    };
  }

  public static verifierContexte(contexte: RequestContext, surface: AuditSecuritySurface): void {
    const policy = this.creerPolicy(surface);

    if (!policy.obligatoire) {
      return;
    }

    if (!contexte.utilisateurId?.trim()) {
      throw new ValidationError(
        "L'utilisateur authentifie est obligatoire pour cette interface Audit.",
        'AUDIT_INTERFACE_AUTH_REQUIRED',
      );
    }

    if (policy.verifierContexteActif && !contexte.roleActif?.trim()) {
      throw new ValidationError(
        'Le contexte actif de securite est obligatoire pour cette interface Audit.',
        'AUDIT_INTERFACE_ACTIVE_CONTEXT_REQUIRED',
      );
    }

    if (policy.verifierTenantActif && !contexte.organisationActiveId && !contexte.ecoleActiveId) {
      throw new ValidationError(
        'Le tenant actif est obligatoire pour cette interface Audit sensible.',
        'AUDIT_INTERFACE_ACTIVE_TENANT_REQUIRED',
      );
    }
  }
}

