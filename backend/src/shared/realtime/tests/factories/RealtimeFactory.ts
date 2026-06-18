import {
  AudienceTempsReel,
  CanalTempsReel,
  ContexteTempsReel,
  EvenementDiffusable,
  EvenementTempsReel,
  PayloadTempsReel,
  PrioriteRealtime,
  RealtimeId,
  TypeDiffusionRealtime,
  ValeurUtilisateur,
} from 'shared/realtime';
import { REALTIME_FIXTURES } from '../fixtures/RealtimeFixtures';

export class RealtimeFactory {
  public static evenement() {
    return new EvenementTempsReel(
      new RealtimeId('evt-1'),
      'NotificationCreee',
      new EvenementDiffusable({
        nom: 'NotificationCreee',
        visible: true,
        impacteInterface: true,
        necessiteReaction: true,
        priorite: PrioriteRealtime.NORMALE,
        typeDiffusion: TypeDiffusionRealtime.MULTICAST,
        valeurUtilisateur: new ValeurUtilisateur(true, 'utile'),
      }),
      new AudienceTempsReel({
        organisationId: REALTIME_FIXTURES.organisationId,
        ecoleId: REALTIME_FIXTURES.ecoleId,
        utilisateurIds: [REALTIME_FIXTURES.utilisateurId],
        permissionsRequises: ['notifications.read'],
      }),
      new CanalTempsReel(REALTIME_FIXTURES.canal),
      new ContexteTempsReel({
        organisationId: REALTIME_FIXTURES.organisationId,
        ecoleId: REALTIME_FIXTURES.ecoleId,
        utilisateurId: REALTIME_FIXTURES.utilisateurId,
        sessionId: REALTIME_FIXTURES.sessionId,
        permissions: ['notifications.read'],
        emittedAt: new Date().toISOString(),
      }),
      new PayloadTempsReel({ titre: 'notification' }),
    );
  }
}
