import { PrioriteRealtime, TypeDiffusionRealtime } from '../../../domain';
import type { PublierEvenementTempsReelCommand } from '../../../application';
import type { RealtimeMonitoringProjection, RealtimeMonitoringSignal } from '../RealtimeMonitoringIntegrationTypes';

export class RealtimeMonitoringMapper {
  public static versCommande(signal: RealtimeMonitoringSignal): PublierEvenementTempsReelCommand {
    return {
      evenementId: signal.evenementId,
      type: signal.type,
      visible: true,
      impacteInterface: true,
      necessiteReaction: signal.critique ?? false,
      priorite: signal.critique ? PrioriteRealtime.CRITIQUE : PrioriteRealtime.IMPORTANTE,
      typeDiffusion: TypeDiffusionRealtime.BROADCAST_CONTROLE,
      raisonValeurUtilisateur: 'actualisation du cockpit monitoring plateforme',
      utileImmediatement: true,
      utilisateurIds: [],
      permissionsRequises: ['monitoring.read'],
      canal: 'monitoring',
      contexte: {
        module: 'monitoring',
        requestId: signal.requestId,
        correlationId: signal.correlationId,
        permissions: ['monitoring.read'],
        emittedAt: new Date().toISOString(),
      },
      payload: signal.payload,
    };
  }

  public static appliquer(projection: RealtimeMonitoringProjection, signal: RealtimeMonitoringSignal): RealtimeMonitoringProjection {
    return {
      totalSignaux: projection.totalSignaux + 1,
      dernierType: `monitoring:${signal.type}`,
      derniereEmission: new Date().toISOString(),
    };
  }
}
