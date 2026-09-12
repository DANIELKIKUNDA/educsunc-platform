import type { Pool } from 'pg';
import type {
  JobDeadLetterNotification,
  PortPersistanceDeadLetterNotification,
} from '../../queues';

/** Persiste les entrees dead-letter et leur reprise dans PostgreSQL. */
export class DepotDeadLettersNotificationsPostgres implements PortPersistanceDeadLetterNotification {
  constructor(private readonly pool: Pool) {}

  public async sauvegarder(job: JobDeadLetterNotification): Promise<void> {
    await this.pool.query(
      `INSERT INTO notifications_dead_letters (
         job_id, notification_id, organisation_id, ecole_id, raison,
         correlation_id, request_id, dead_letter_at, recovered_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)
       ON CONFLICT (job_id) DO UPDATE SET
         notification_id = EXCLUDED.notification_id,
         organisation_id = EXCLUDED.organisation_id,
         ecole_id = EXCLUDED.ecole_id,
         raison = EXCLUDED.raison,
         correlation_id = EXCLUDED.correlation_id,
         request_id = EXCLUDED.request_id,
         dead_letter_at = EXCLUDED.dead_letter_at,
         recovered_at = NULL`,
      [
        job.identifiantJob,
        job.identifiantNotification,
        job.organisationId ?? null,
        job.ecoleId ?? null,
        job.raisonDeadLetter,
        job.correlationId ?? null,
        job.requestId ?? null,
        job.deadLetterLe,
      ],
    );
  }

  public async marquerRecuperee(identifiantJob: string): Promise<void> {
    await this.pool.query(
      `UPDATE notifications_dead_letters
       SET recovered_at = NOW()
       WHERE job_id = $1 AND recovered_at IS NULL`,
      [identifiantJob],
    );
  }
}
