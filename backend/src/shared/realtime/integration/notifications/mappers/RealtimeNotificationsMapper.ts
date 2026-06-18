import { PrioriteRealtime, TypeDiffusionRealtime } from '../../../domain';
import type { RealtimeNotificationEvenement } from '../RealtimeNotificationsIntegrationTypes';

export class RealtimeNotificationsMapper {
  public static versCommande(evenement: RealtimeNotificationEvenement) {
    return {
      evenementId: `notif-${evenement.type}-${evenement.audience.length}`,
      type: evenement.type,
      visible: true,
      impacteInterface: true,
      necessiteReaction: true,
      priorite: PrioriteRealtime.NORMALE,
      typeDiffusion: TypeDiffusionRealtime.MULTICAST,
      raisonValeurUtilisateur: 'notification visible immediate',
      utileImmediatement: true,
      organisationId: evenement.organisationId,
      ecoleId: evenement.ecoleId,
      utilisateurIds: [...evenement.audience],
      permissionsRequises: ['notifications.read'],
      canal: 'notifications',
      contexte: {
        organisationId: evenement.organisationId,
        ecoleId: evenement.ecoleId,
        permissions: ['notifications.read'],
        emittedAt: new Date().toISOString(),
      },
      payload: evenement.payload,
    };
  }
}
