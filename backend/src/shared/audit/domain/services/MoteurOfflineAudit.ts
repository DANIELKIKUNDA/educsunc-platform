import { AuditOfflineMetadata } from '../entities';
import { StatutSynchronisationAudit } from '../value-objects';

// Ce moteur formalise le cycle de vie offline-first de l'audit.
export class MoteurOfflineAudit {
  public construire(params: {
    modeOffline: boolean;
    dateLocaleAction?: Date;
    dateSynchronisation?: Date;
    appareilSource?: string;
    conflitDetecte?: boolean;
    conflitResolu?: boolean;
    actionRejouee?: boolean;
    actionIgnoreePourDoublon?: boolean;
  }): AuditOfflineMetadata | undefined {
    if (!params.modeOffline && !params.dateSynchronisation && !params.conflitDetecte) {
      return undefined;
    }
    const statut = params.conflitDetecte
      ? 'CONFLIT'
      : params.dateSynchronisation
        ? 'SYNCHRONISE'
        : params.modeOffline
          ? 'LOCAL'
          : 'EN_ATTENTE_SYNCHRONISATION';
    return new AuditOfflineMetadata({
      idAuditOfflineMetadata: `offline-${Date.now()}`,
      statutSynchronisation: new StatutSynchronisationAudit(statut),
      dateLocaleAction: params.dateLocaleAction,
      dateSynchronisation: params.dateSynchronisation,
      synchronise: Boolean(params.dateSynchronisation),
      replay: Boolean(params.actionRejouee),
      retry: Boolean(params.actionIgnoreePourDoublon),
      conflit: Boolean(params.conflitDetecte),
      resolutionConflit: params.conflitResolu ? 'RESOLU' : undefined,
      sourceOffline: params.appareilSource,
    });
  }
}
