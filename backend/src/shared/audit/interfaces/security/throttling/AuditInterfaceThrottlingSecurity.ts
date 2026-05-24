import type { AuditInterfaceThrottlingPolicy, AuditSecuritySurface } from '../SecurityInterfaceTypes';

const THROTTLING_BY_SURFACE: Record<AuditSecuritySurface, AuditInterfaceThrottlingPolicy> = {
  AUTH: { cle: 'audit:auth', limite: 30, fenetreMs: 60_000, criticite: 'NORMALE' },
  FORENSIC: { cle: 'audit:forensic', limite: 10, fenetreMs: 60_000, criticite: 'CRITIQUE' },
  REPLAY: { cle: 'audit:replay', limite: 5, fenetreMs: 60_000, criticite: 'CRITIQUE' },
  RETRY: { cle: 'audit:retry', limite: 8, fenetreMs: 60_000, criticite: 'CRITIQUE' },
  SYNCHRONIZATION: { cle: 'audit:sync', limite: 12, fenetreMs: 60_000, criticite: 'ELEVEE' },
  EXPORTS: { cle: 'audit:exports', limite: 6, fenetreMs: 60_000, criticite: 'CRITIQUE' },
  MONITORING: { cle: 'audit:monitoring', limite: 20, fenetreMs: 60_000, criticite: 'ELEVEE' },
  WORKERS: { cle: 'audit:workers', limite: 10, fenetreMs: 60_000, criticite: 'ELEVEE' },
  QUEUES: { cle: 'audit:queues', limite: 10, fenetreMs: 60_000, criticite: 'ELEVEE' },
  INCIDENTS: { cle: 'audit:incidents', limite: 12, fenetreMs: 60_000, criticite: 'ELEVEE' },
  ANOMALIES: { cle: 'audit:anomalies', limite: 12, fenetreMs: 60_000, criticite: 'ELEVEE' },
  RETENTION: { cle: 'audit:retention', limite: 4, fenetreMs: 60_000, criticite: 'CRITIQUE' },
  RUNTIME: { cle: 'audit:runtime', limite: 15, fenetreMs: 60_000, criticite: 'ELEVEE' },
};

export class AuditInterfaceThrottlingSecurity {
  public static creerPolicy(surface: AuditSecuritySurface): AuditInterfaceThrottlingPolicy {
    return THROTTLING_BY_SURFACE[surface];
  }
}

