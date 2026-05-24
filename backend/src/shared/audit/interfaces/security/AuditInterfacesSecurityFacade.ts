import type { RequestContext } from 'shared/context';
import { AuditInterfaceAuthSecurity } from './auth/AuditInterfaceAuthSecurity';
import { AuditInterfaceAnomaliesSecurity } from './anomalies/AuditInterfaceAnomaliesSecurity';
import { AuditInterfaceExportsSecurity } from './exports/AuditInterfaceExportsSecurity';
import { AuditInterfaceForensicSecurity } from './forensic/AuditInterfaceForensicSecurity';
import { AuditInterfaceHeadersSecurity } from './headers/AuditInterfaceHeadersSecurity';
import { AuditInterfaceIncidentsSecurity } from './incidents/AuditInterfaceIncidentsSecurity';
import { AuditInterfaceMaskingSecurity } from './masking/AuditInterfaceMaskingSecurity';
import { AuditInterfaceMonitoringSecurity } from './monitoring/AuditInterfaceMonitoringSecurity';
import { AuditInterfaceObservabilitySecurity } from './observability/AuditInterfaceObservabilitySecurity';
import { AuditInterfacePermissionsSecurity } from './permissions/AuditInterfacePermissionsSecurity';
import { AuditInterfaceQueuesSecurity } from './queues/AuditInterfaceQueuesSecurity';
import { AuditInterfaceRecoverySecurity } from './recovery/AuditInterfaceRecoverySecurity';
import { AuditInterfaceReplaySecurity } from './replay/AuditInterfaceReplaySecurity';
import { AuditInterfaceRetrySecurity } from './retry/AuditInterfaceRetrySecurity';
import { AuditInterfaceRuntimeSecurity } from './runtime/AuditInterfaceRuntimeSecurity';
import type {
  AuditInterfaceAuthenticationPolicy,
  AuditInterfaceAuthorizationPolicy,
  AuditInterfaceHeaderPolicy,
  AuditInterfaceMaskingPolicy,
  AuditInterfaceObservabilityPolicy,
  AuditInterfaceRuntimeSecurityPolicy,
  AuditInterfaceThrottlingPolicy,
  AuditInterfaceValidationPolicy,
  AuditSecuritySurface,
} from './SecurityInterfaceTypes';
import { AuditInterfaceScopesSecurity } from './scopes/AuditInterfaceScopesSecurity';
import { AuditInterfaceSynchronizationSecurity } from './synchronization/AuditInterfaceSynchronizationSecurity';
import { AuditInterfaceThrottlingSecurity } from './throttling/AuditInterfaceThrottlingSecurity';
import { AuditInterfaceValidationSecurity } from './validation/AuditInterfaceValidationSecurity';
import { AuditInterfaceWorkersSecurity } from './workers/AuditInterfaceWorkersSecurity';

export class AuditInterfacesSecurityFacade {
  public auth(surface: AuditSecuritySurface): AuditInterfaceAuthenticationPolicy {
    return AuditInterfaceAuthSecurity.creerPolicy(surface);
  }

  public autorisations(surface: AuditSecuritySurface): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: AuditInterfacePermissionsSecurity.permissionsDe(surface),
      scopes: AuditInterfaceScopesSecurity.scopesDe(surface),
      restreindreTenant: surface !== 'AUTH',
    };
  }

  public throttling(surface: AuditSecuritySurface): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy(surface);
  }

  public validation(): AuditInterfaceValidationPolicy {
    return AuditInterfaceValidationSecurity.creer();
  }

  public masking(): AuditInterfaceMaskingPolicy {
    return AuditInterfaceMaskingSecurity.creer();
  }

  public observability(): AuditInterfaceObservabilityPolicy {
    return AuditInterfaceObservabilitySecurity.creer();
  }

  public headers(): AuditInterfaceHeaderPolicy {
    return AuditInterfaceHeadersSecurity.creer();
  }

  public runtime(): AuditInterfaceRuntimeSecurityPolicy {
    return AuditInterfaceRuntimeSecurity.creer();
  }

  public verifierContexte(contexte: RequestContext, surface: AuditSecuritySurface): void {
    AuditInterfaceAuthSecurity.verifierContexte(contexte, surface);
  }

  public forensic(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceForensicSecurity.consultation();
  }

  public forensicExport(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceForensicSecurity.exportation();
  }

  public replay(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceReplaySecurity.autorisation();
  }

  public retry(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceRetrySecurity.autorisation();
  }

  public synchronization(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceSynchronizationSecurity.autorisation();
  }

  public exports(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceExportsSecurity.generation();
  }

  public monitoring(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceMonitoringSecurity.lecture();
  }

  public workers(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceWorkersSecurity.administration();
  }

  public queues(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceQueuesSecurity.administration();
  }

  public incidents(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceIncidentsSecurity.lecture();
  }

  public anomalies(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceAnomaliesSecurity.lecture();
  }

  public recovery(): AuditInterfaceAuthorizationPolicy {
    return AuditInterfaceRecoverySecurity.administration();
  }
}

