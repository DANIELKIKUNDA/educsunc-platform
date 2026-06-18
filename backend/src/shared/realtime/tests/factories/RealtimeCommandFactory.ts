import { PrioriteRealtime, TypeDiffusionRealtime } from 'shared/realtime';
import { REALTIME_FIXTURES } from '../fixtures/RealtimeFixtures';

export class RealtimeCommandFactory {
  public static publication(overrides: Partial<import('shared/realtime').PublierEvenementTempsReelCommand> = {}) {
    return {
      evenementId: 'evt-1',
      type: 'NotificationCreee',
      visible: true,
      impacteInterface: true,
      necessiteReaction: true,
      priorite: PrioriteRealtime.NORMALE,
      typeDiffusion: TypeDiffusionRealtime.MULTICAST,
      raisonValeurUtilisateur: 'mise a jour visible immediate',
      utileImmediatement: true,
      organisationId: REALTIME_FIXTURES.organisationId,
      ecoleId: REALTIME_FIXTURES.ecoleId,
      utilisateurIds: [REALTIME_FIXTURES.utilisateurId],
      permissionsRequises: ['notifications.read'],
      canal: REALTIME_FIXTURES.canal,
      contexte: {
        organisationId: REALTIME_FIXTURES.organisationId,
        ecoleId: REALTIME_FIXTURES.ecoleId,
        utilisateurId: REALTIME_FIXTURES.utilisateurId,
        sessionId: REALTIME_FIXTURES.sessionId,
        permissions: ['notifications.read'],
        emittedAt: new Date().toISOString(),
      },
      payload: {
        titre: 'notification',
      },
      ...overrides,
    };
  }

  public static connexion(overrides: Partial<import('shared/realtime').OuvrirConnexionTempsReelCommand> = {}) {
    return {
      connexionId: 'conn-1',
      utilisateurId: REALTIME_FIXTURES.utilisateurId,
      contexte: {
        organisationId: REALTIME_FIXTURES.organisationId,
        ecoleId: REALTIME_FIXTURES.ecoleId,
        utilisateurId: REALTIME_FIXTURES.utilisateurId,
        sessionId: REALTIME_FIXTURES.sessionId,
        permissions: ['notifications.read'],
        emittedAt: new Date().toISOString(),
      },
      ...overrides,
    };
  }

  public static abonnement(overrides: Partial<import('shared/realtime').AbonnerConnexionTempsReelCommand> = {}) {
    return {
      abonnementId: 'sub-1',
      connexionId: 'conn-1',
      canal: REALTIME_FIXTURES.canal,
      ...overrides,
    };
  }
}
