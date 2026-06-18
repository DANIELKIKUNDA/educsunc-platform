import { randomUUID } from 'node:crypto';
import {
  type EnregistrementNotificationMemoire,
} from 'shared/notifications';
import { EntreeChronologieNotification } from 'shared/notifications/domain';
import {
  ACTEUR_NOTIFICATION_TEST,
  CORRELATION_NOTIFICATION_TEST,
  ECOLE_NOTIFICATION_TEST,
  ORGANISATION_NOTIFICATION_TEST,
  REQUEST_NOTIFICATION_TEST,
} from '../fixtures/NotificationsFixtures';

// Ce fichier fabrique des objets runtime et persistence stables pour les tests Notifications.

/** Cette classe construit les snapshots techniques utilises par les tests runtime. */
export class RuntimeNotificationFactory {
  /** Cette methode cree un enregistrement memoire minimal et coherent. */
  public static creerEnregistrement(
    surcharges: Partial<EnregistrementNotificationMemoire> = {},
  ): EnregistrementNotificationMemoire {
    return {
      identifiant: surcharges.identifiant ?? randomUUID(),
      type: surcharges.type ?? 'INFORMATION_GENERALE',
      statut: surcharges.statut ?? 'QUEUED',
      priorite: surcharges.priorite ?? 'NORMAL',
      canaux: surcharges.canaux ?? ['IN_APP', 'EMAIL'],
      titre: surcharges.titre ?? 'Snapshot test',
      message: surcharges.message ?? 'Snapshot de notification',
      placeholders: surcharges.placeholders ?? {},
      organisationId: surcharges.organisationId ?? ORGANISATION_NOTIFICATION_TEST,
      ecoleId: surcharges.ecoleId ?? ECOLE_NOTIFICATION_TEST,
      correlationId: surcharges.correlationId ?? CORRELATION_NOTIFICATION_TEST,
      requestId: surcharges.requestId ?? REQUEST_NOTIFICATION_TEST,
      compteurRetry: surcharges.compteurRetry ?? 0,
      compteurReplay: surcharges.compteurReplay ?? 0,
      dateArchivage: surcharges.dateArchivage,
      raisonArchivage: surcharges.raisonArchivage,
      creeLe: surcharges.creeLe ?? new Date(),
      misAJourLe: surcharges.misAJourLe ?? new Date(),
    };
  }

  /** Cette methode cree une entree de chronology append-only pour les tests. */
  public static creerEntreeChronologie(
    identifiant: string,
    typeEvenement = 'TEST_EVENT',
    statutAvant: 'CREATED' | 'QUEUED' | 'PROCESSING' | 'SENT' | undefined = 'CREATED',
    statutApres: 'QUEUED' | 'PROCESSING' | 'ARCHIVED' = 'QUEUED',
  ): EntreeChronologieNotification {
    return EntreeChronologieNotification.creer({
      identifiant,
      horodatage: new Date(),
      typeEvenement,
      origine: 'SYSTEM_EVENT',
      statutAvant,
      statutApres,
      correlationId: CORRELATION_NOTIFICATION_TEST,
      requestId: REQUEST_NOTIFICATION_TEST,
      acteur: ACTEUR_NOTIFICATION_TEST,
      metadonnees: { test: true },
      metadonneesForensic: { forensic: true },
    });
  }
}
