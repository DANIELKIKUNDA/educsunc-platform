import type { Pool } from 'pg';
import type {
  ModeleLectureArchivesNotifications,
  ModeleLectureChronologieNotification,
  ModeleLectureDeadLettersNotifications,
  ModeleLectureDetailsNotification,
  ModeleLectureDiagnosticReplayNotification,
  ModeleLectureHistoriqueRetriesNotification,
  ModeleLectureListeNotifications,
  ModeleLectureMonitoringNotifications,
  ModeleLectureTenantNotifications,
  ModeleLectureTraceEscaladeNotification,
  PortLectureNotifications,
  RequeteArchivesNotifications,
  RequeteChronologieNotification,
  RequeteDeadLettersNotifications,
  RequeteDetailsNotification,
  RequeteDiagnosticReplayNotification,
  RequeteHistoriqueRetriesNotification,
  RequeteListerNotifications,
  RequeteMonitoringNotifications,
  RequeteTenantNotifications,
  RequeteTraceEscaladeNotification,
} from '../../../application';
import type { CanalNotification, Notification, StatutNotification, TypeNotification } from '../../../domain';
import { MappeurPersistenceNotification } from '../MappeurPersistenceNotification';
import type { EnregistrementNotificationMemoire } from '../TypesPersistenceNotification';
import { CodecAgregatNotificationPostgres } from './CodecAgregatNotificationPostgres';

interface LigneProjectionNotificationPostgres {
  readonly id: string;
  readonly organisation_id: string | null;
  readonly ecole_id: string | null;
  readonly statut: string;
  readonly type_notification: string | null;
  readonly priorite: string | null;
  readonly canaux: string[];
  readonly titre: string | null;
  readonly message: string | null;
  readonly placeholders: Record<string, string>;
  readonly correlation_id: string | null;
  readonly request_id: string | null;
  readonly compteur_retry: number;
  readonly compteur_replay: number;
  readonly archived_at: Date | string | null;
  readonly archive_reason: string | null;
  readonly snapshot: unknown;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

interface LigneDeadLetterPostgres {
  readonly notification_id: string;
  readonly raison: string;
  readonly dead_letter_at: Date | string;
  readonly correlation_id: string | null;
  readonly request_id: string | null;
  readonly organisation_id: string | null;
  readonly ecole_id: string | null;
}

/** Sert toutes les lectures de production depuis les donnees durables Notifications. */
export class DepotLectureNotificationsPostgres implements PortLectureNotifications {
  constructor(
    private readonly pool: Pool,
    private readonly codec = new CodecAgregatNotificationPostgres(),
  ) {}

  public async lister(requete: RequeteListerNotifications): Promise<ModeleLectureListeNotifications> {
    const { clause, valeurs } = this.construireFiltres(requete);
    const total = await this.compterNotifications(clause, valeurs);
    const debut = (requete.page - 1) * requete.taillePage;
    const resultat = await this.pool.query<LigneProjectionNotificationPostgres>(
      `${this.selectionProjection()} ${clause}
       ORDER BY created_at DESC
       LIMIT $${valeurs.length + 1} OFFSET $${valeurs.length + 2}`,
      [...valeurs, requete.taillePage, debut],
    );
    const projections = resultat.rows.map((ligne) => this.versProjection(ligne));
    return MappeurPersistenceNotification.versModeleListe(
      projections,
      requete.page,
      requete.taillePage,
      total,
    );
  }

  public async obtenirDetails(
    requete: RequeteDetailsNotification,
  ): Promise<ModeleLectureDetailsNotification | null> {
    const resultat = await this.pool.query<LigneProjectionNotificationPostgres>(
      `${this.selectionProjection()}
       WHERE id = $1
         AND ($2::text IS NULL OR organisation_id = $2)
         AND ($3::text IS NULL OR ecole_id = $3)`,
      [requete.identifiantNotification, requete.organisationId ?? null, requete.ecoleId ?? null],
    );
    return resultat.rows[0]
      ? MappeurPersistenceNotification.versModeleDetails(this.versProjection(resultat.rows[0]))
      : null;
  }

  public async obtenirChronologie(
    requete: RequeteChronologieNotification,
  ): Promise<ModeleLectureChronologieNotification> {
    const notification = await this.chargerNotificationAutorisee(requete);
    return MappeurPersistenceNotification.versModeleChronologie(
      requete.identifiantNotification,
      notification?.obtenirTimeline() ?? [],
    );
  }

  public async obtenirHistoriqueRetries(
    requete: RequeteHistoriqueRetriesNotification,
  ): Promise<ModeleLectureHistoriqueRetriesNotification> {
    const notification = await this.chargerNotificationAutorisee(requete);
    return notification
      ? MappeurPersistenceNotification.versModeleHistoriqueRetries(notification)
      : { identifiantNotification: requete.identifiantNotification, retries: [] };
  }

  public async obtenirMonitoring(
    requete: RequeteMonitoringNotifications,
  ): Promise<ModeleLectureMonitoringNotifications> {
    const filtres = this.construireFiltresTenant(requete.organisationId, requete.ecoleId);
    const notifications = await this.pool.query<{
      total: string;
      total_echecs: string;
      total_retries: string;
    }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE statut = 'FAILED')::text AS total_echecs,
              COUNT(*) FILTER (WHERE statut = 'RETRYING')::text AS total_retries
       FROM notifications_aggregates ${filtres.clause}`,
      filtres.valeurs,
    );
    const totalDeadLetters = await this.compterDeadLetters(
      requete.organisationId,
      requete.ecoleId,
    );
    const ligne = notifications.rows[0];
    return {
      totalNotifications: Number(ligne?.total ?? 0),
      totalEnEchec: Number(ligne?.total_echecs ?? 0),
      totalEnRetry: Number(ligne?.total_retries ?? 0),
      totalDeadLetters,
      fournisseursDegrades: [],
      queuesSaturees: [],
      dateObservation: new Date(),
    };
  }

  public async obtenirDeadLetters(
    requete: RequeteDeadLettersNotifications,
  ): Promise<ModeleLectureDeadLettersNotifications> {
    const filtres = this.construireFiltresTenant(requete.organisationId, requete.ecoleId);
    const total = await this.compterDeadLetters(requete.organisationId, requete.ecoleId);
    const debut = (requete.page - 1) * requete.taillePage;
    const resultat = await this.pool.query<LigneDeadLetterPostgres>(
      `SELECT notification_id, raison, dead_letter_at, correlation_id, request_id,
              organisation_id, ecole_id
       FROM notifications_dead_letters ${filtres.clause}
       AND recovered_at IS NULL
       ORDER BY dead_letter_at DESC
       LIMIT $${filtres.valeurs.length + 1} OFFSET $${filtres.valeurs.length + 2}`,
      [...filtres.valeurs, requete.taillePage, debut],
    );
    return {
      elements: resultat.rows.map((ligne) => ({
        identifiantNotification: ligne.notification_id,
        raison: ligne.raison,
        dateEntree: new Date(ligne.dead_letter_at),
        correlationId: ligne.correlation_id ?? undefined,
        requestId: ligne.request_id ?? undefined,
        organisationId: ligne.organisation_id ?? undefined,
        ecoleId: ligne.ecole_id ?? undefined,
      })),
      page: requete.page,
      taillePage: requete.taillePage,
      total,
    };
  }

  public async obtenirArchives(
    requete: RequeteArchivesNotifications,
  ): Promise<ModeleLectureArchivesNotifications> {
    const filtres = this.construireFiltres({
      ...requete,
      statut: 'ARCHIVED',
    });
    if (requete.dateDebutArchivage) {
      filtres.valeurs.push(requete.dateDebutArchivage);
      filtres.conditions.push(`archived_at >= $${filtres.valeurs.length}`);
    }
    if (requete.dateFinArchivage) {
      filtres.valeurs.push(requete.dateFinArchivage);
      filtres.conditions.push(`archived_at <= $${filtres.valeurs.length}`);
    }
    const clause = `WHERE ${filtres.conditions.join(' AND ')}`;
    const total = await this.compterNotifications(clause, filtres.valeurs);
    const debut = (requete.page - 1) * requete.taillePage;
    const resultat = await this.pool.query<LigneProjectionNotificationPostgres>(
      `${this.selectionProjection()} ${clause}
       ORDER BY archived_at DESC NULLS LAST
       LIMIT $${filtres.valeurs.length + 1} OFFSET $${filtres.valeurs.length + 2}`,
      [...filtres.valeurs, requete.taillePage, debut],
    );
    return MappeurPersistenceNotification.versModeleArchives(
      resultat.rows.map((ligne) => this.versProjection(ligne)),
      requete.page,
      requete.taillePage,
      total,
    );
  }

  public async obtenirDiagnosticReplay(
    requete: RequeteDiagnosticReplayNotification,
  ): Promise<ModeleLectureDiagnosticReplayNotification> {
    const notification = await this.chargerNotificationAutorisee(requete);
    return notification
      ? MappeurPersistenceNotification.versModeleDiagnosticReplay(notification)
      : {
          identifiantNotification: requete.identifiantNotification,
          totalReplays: 0,
          rebatirChronologie: true,
          autoriserRenduCanal: false,
        };
  }

  public async obtenirTraceEscalade(
    requete: RequeteTraceEscaladeNotification,
  ): Promise<ModeleLectureTraceEscaladeNotification> {
    const notification = await this.chargerNotificationAutorisee(requete);
    return notification
      ? MappeurPersistenceNotification.versModeleTraceEscalade(notification)
      : { identifiantNotification: requete.identifiantNotification, elements: [] };
  }

  public async obtenirVueTenant(
    requete: RequeteTenantNotifications,
  ): Promise<ModeleLectureTenantNotifications> {
    const filtres = this.construireFiltresTenant(requete.organisationId, requete.ecoleId);
    const resultat = await this.pool.query<{
      total: string;
      total_archivees: string;
      total_echecs: string;
    }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE statut = 'ARCHIVED')::text AS total_archivees,
              COUNT(*) FILTER (WHERE statut = 'FAILED')::text AS total_echecs
       FROM notifications_aggregates ${filtres.clause}`,
      filtres.valeurs,
    );
    const ligne = resultat.rows[0];
    return {
      organisationId: requete.organisationId,
      ecoleId: requete.ecoleId,
      totalNotifications: Number(ligne?.total ?? 0),
      totalArchivees: Number(ligne?.total_archivees ?? 0),
      totalDeadLetters: await this.compterDeadLetters(requete.organisationId, requete.ecoleId),
      totalEnEchec: Number(ligne?.total_echecs ?? 0),
      dateObservation: new Date(),
    };
  }

  private construireFiltres(requete: Partial<RequeteListerNotifications>) {
    const conditions = ['TRUE'];
    const valeurs: unknown[] = [];
    const ajouter = (condition: string, valeur: unknown) => {
      valeurs.push(valeur);
      conditions.push(condition.replace('?', `$${valeurs.length}`));
    };
    if (requete.organisationId) ajouter('organisation_id = ?', requete.organisationId);
    if (requete.ecoleId) ajouter('ecole_id = ?', requete.ecoleId);
    if (requete.destinataireId) ajouter('? = ANY(destinataire_ids)', requete.destinataireId);
    if (requete.statut) ajouter('statut = ?', requete.statut);
    if (requete.type) ajouter('type_notification = ?', requete.type);
    if (requete.canal) ajouter('? = ANY(canaux)', requete.canal);
    if (requete.dateDebut) ajouter('created_at >= ?', requete.dateDebut);
    if (requete.dateFin) ajouter('created_at <= ?', requete.dateFin);
    return { conditions, clause: `WHERE ${conditions.join(' AND ')}`, valeurs };
  }

  private construireFiltresTenant(organisationId?: string, ecoleId?: string) {
    const conditions = ['TRUE'];
    const valeurs: unknown[] = [];
    if (organisationId) {
      valeurs.push(organisationId);
      conditions.push(`organisation_id = $${valeurs.length}`);
    }
    if (ecoleId) {
      valeurs.push(ecoleId);
      conditions.push(`ecole_id = $${valeurs.length}`);
    }
    return { clause: `WHERE ${conditions.join(' AND ')}`, valeurs };
  }

  private async chargerNotificationAutorisee(requete: {
    readonly identifiantNotification: string;
    readonly organisationId?: string;
    readonly ecoleId?: string;
  }): Promise<Notification | null> {
    const resultat = await this.pool.query<{ snapshot: unknown }>(
      `SELECT snapshot FROM notifications_aggregates
       WHERE id = $1
         AND ($2::text IS NULL OR organisation_id = $2)
         AND ($3::text IS NULL OR ecole_id = $3)`,
      [requete.identifiantNotification, requete.organisationId ?? null, requete.ecoleId ?? null],
    );
    return resultat.rows[0] ? this.codec.decoder(resultat.rows[0].snapshot) : null;
  }

  private async compterNotifications(clause: string, valeurs: readonly unknown[]): Promise<number> {
    const resultat = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM notifications_aggregates ${clause}`,
      [...valeurs],
    );
    return Number(resultat.rows[0]?.total ?? 0);
  }

  private async compterDeadLetters(organisationId?: string, ecoleId?: string): Promise<number> {
    const filtres = this.construireFiltresTenant(organisationId, ecoleId);
    const resultat = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM notifications_dead_letters
       ${filtres.clause} AND recovered_at IS NULL`,
      filtres.valeurs,
    );
    return Number(resultat.rows[0]?.total ?? 0);
  }

  private selectionProjection(): string {
    return `SELECT id, organisation_id, ecole_id, statut, type_notification, priorite,
                   canaux, titre, message, placeholders, correlation_id, request_id,
                   compteur_retry, compteur_replay, archived_at, archive_reason,
                   snapshot, created_at, updated_at
            FROM notifications_aggregates`;
  }

  private versProjection(ligne: LigneProjectionNotificationPostgres): EnregistrementNotificationMemoire {
    if (!ligne.type_notification || !ligne.priorite || ligne.message === null) {
      return MappeurPersistenceNotification.versEnregistrement(this.codec.decoder(ligne.snapshot));
    }
    return {
      identifiant: ligne.id,
      type: ligne.type_notification as TypeNotification,
      statut: ligne.statut as StatutNotification,
      priorite: ligne.priorite as EnregistrementNotificationMemoire['priorite'],
      canaux: ligne.canaux as CanalNotification[],
      titre: ligne.titre ?? undefined,
      message: ligne.message,
      placeholders: ligne.placeholders ?? {},
      organisationId: ligne.organisation_id ?? undefined,
      ecoleId: ligne.ecole_id ?? undefined,
      correlationId: ligne.correlation_id ?? undefined,
      requestId: ligne.request_id ?? undefined,
      compteurRetry: ligne.compteur_retry,
      compteurReplay: ligne.compteur_replay,
      dateArchivage: ligne.archived_at ? new Date(ligne.archived_at) : undefined,
      raisonArchivage: ligne.archive_reason ?? undefined,
      creeLe: new Date(ligne.created_at),
      misAJourLe: new Date(ligne.updated_at),
    };
  }
}
