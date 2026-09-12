import type { Pool } from 'pg';
import type { DepotNotification, Notification } from '../../../domain';
import type { PortDepotNotifications } from '../../../application';
import { MappeurPersistenceNotification } from '../MappeurPersistenceNotification';
import { CodecAgregatNotificationPostgres } from './CodecAgregatNotificationPostgres';

/** Persiste atomiquement l'agregat et ses colonnes de lecture indexables. */
export class DepotNotificationsPostgres implements DepotNotification, PortDepotNotifications {
  constructor(
    private readonly pool: Pool,
    private readonly codec = new CodecAgregatNotificationPostgres(),
  ) {}

  public async sauvegarder(notification: Notification): Promise<void> {
    const projection = MappeurPersistenceNotification.versEnregistrement(notification);
    const destinataireIds = notification.obtenirDestinataires().map((destinataire) => destinataire.obtenirId());

    await this.pool.query(
      `INSERT INTO notifications_aggregates (
         id, organisation_id, ecole_id, statut, type_notification, priorite, canaux,
         destinataire_ids, titre, message, placeholders, correlation_id, request_id,
         compteur_retry, compteur_replay, archived_at, archive_reason, snapshot,
         created_at, updated_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7::text[], $8::text[], $9, $10, $11::jsonb,
         $12, $13, $14, $15, $16, $17, $18::jsonb, $19, $20
       )
       ON CONFLICT (id) DO UPDATE SET
         organisation_id = EXCLUDED.organisation_id,
         ecole_id = EXCLUDED.ecole_id,
         statut = EXCLUDED.statut,
         type_notification = EXCLUDED.type_notification,
         priorite = EXCLUDED.priorite,
         canaux = EXCLUDED.canaux,
         destinataire_ids = EXCLUDED.destinataire_ids,
         titre = EXCLUDED.titre,
         message = EXCLUDED.message,
         placeholders = EXCLUDED.placeholders,
         correlation_id = EXCLUDED.correlation_id,
         request_id = EXCLUDED.request_id,
         compteur_retry = EXCLUDED.compteur_retry,
         compteur_replay = EXCLUDED.compteur_replay,
         archived_at = EXCLUDED.archived_at,
         archive_reason = EXCLUDED.archive_reason,
         snapshot = EXCLUDED.snapshot,
         updated_at = EXCLUDED.updated_at`,
      [
        projection.identifiant,
        projection.organisationId ?? null,
        projection.ecoleId ?? null,
        projection.statut,
        projection.type,
        projection.priorite,
        [...projection.canaux],
        destinataireIds,
        projection.titre ?? null,
        projection.message,
        JSON.stringify(projection.placeholders),
        projection.correlationId ?? null,
        projection.requestId ?? null,
        projection.compteurRetry,
        projection.compteurReplay,
        projection.dateArchivage ?? null,
        projection.raisonArchivage ?? null,
        JSON.stringify(this.codec.encoder(notification)),
        projection.creeLe,
        projection.misAJourLe,
      ],
    );
  }

  public async rechercherParId(identifiantNotification: string): Promise<Notification | null> {
    const resultat = await this.pool.query<{ snapshot: unknown }>(
      'SELECT snapshot FROM notifications_aggregates WHERE id = $1',
      [identifiantNotification],
    );
    return resultat.rows[0] ? this.codec.decoder(resultat.rows[0].snapshot) : null;
  }
}
