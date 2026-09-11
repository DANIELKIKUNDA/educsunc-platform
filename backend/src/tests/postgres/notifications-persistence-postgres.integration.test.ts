import assert from 'node:assert/strict';
import test from 'node:test';
import { creerPoolPostgresAuth } from '../../shared/auth/infrastructure';
import {
  DepotDeadLettersNotificationsPostgres,
  DepotLectureNotificationsPostgres,
  DepotNotificationsPostgres,
  MigrateurPostgresNotifications,
} from '../../shared/notifications/infrastructure/persistence';
import { NotificationFactory } from '../../shared/notifications/tests/factories/NotificationFactory';
import {
  ORGANISATION_NOTIFICATION_TEST,
  ECOLE_NOTIFICATION_TEST,
} from '../../shared/notifications/tests/fixtures/NotificationsFixtures';

test('PostgreSQL preserve les lectures Notifications apres recreation des repositories', async () => {
  const poolEcriture = creerPoolPostgresAuth();
  await new MigrateurPostgresNotifications(poolEcriture).executerToutes();
  const notification = NotificationFactory.creer();
  const identifiant = notification.obtenirIdentifiant().obtenirValeur();

  try {
    await new DepotNotificationsPostgres(poolEcriture).sauvegarder(notification);
  } finally {
    await poolEcriture.end();
  }

  const poolLecture = creerPoolPostgresAuth();
  try {
    const lecture = new DepotLectureNotificationsPostgres(poolLecture);
    const listeAutorisee = await lecture.lister({
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
      page: 1,
      taillePage: 20,
    });
    assert.ok(listeAutorisee.elements.some((element) => element.identifiant === identifiant));

    const listeAutreTenant = await lecture.lister({
      organisationId: 'organisation-etrangere',
      page: 1,
      taillePage: 20,
    });
    assert.equal(listeAutreTenant.elements.some((element) => element.identifiant === identifiant), false);

    const detailInterdit = await lecture.obtenirDetails({
      identifiantNotification: identifiant,
      organisationId: 'organisation-etrangere',
    });
    assert.equal(detailInterdit, null);

    const chronologie = await lecture.obtenirChronologie({
      identifiantNotification: identifiant,
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
    });
    assert.ok(chronologie.elements.length > 0);
  } finally {
    await poolLecture.query('DELETE FROM notifications_aggregates WHERE id = $1', [identifiant]);
    await poolLecture.end();
  }
});

test('PostgreSQL preserve et isole les dead letters Notifications', async () => {
  const pool = creerPoolPostgresAuth();
  await new MigrateurPostgresNotifications(pool).executerToutes();
  const depotDeadLetters = new DepotDeadLettersNotificationsPostgres(pool);
  const lecture = new DepotLectureNotificationsPostgres(pool);
  const identifiantJob = `job-notifications-postgres-${Date.now()}`;

  try {
    await depotDeadLetters.sauvegarder({
      identifiantJob,
      identifiantNotification: 'notification-dead-letter-postgres',
      typeFile: 'DEAD_LETTER',
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
      correlationId: 'correlation-dead-letter-postgres',
      requestId: 'request-dead-letter-postgres',
      metadata: {},
      tentative: 3,
      creeLe: new Date(),
      disponibleLe: new Date(),
      raisonDeadLetter: 'Transport indisponible pendant la certification.',
      deadLetterLe: new Date(),
    });

    const autorisees = await lecture.obtenirDeadLetters({
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
      page: 1,
      taillePage: 20,
    });
    assert.ok(autorisees.elements.some(
      (element) => element.identifiantNotification === 'notification-dead-letter-postgres',
    ));

    const interdites = await lecture.obtenirDeadLetters({
      organisationId: 'organisation-etrangere',
      page: 1,
      taillePage: 20,
    });
    assert.equal(interdites.elements.length, 0);

    await depotDeadLetters.marquerRecuperee(identifiantJob);
    const apresReprise = await lecture.obtenirDeadLetters({
      organisationId: ORGANISATION_NOTIFICATION_TEST,
      ecoleId: ECOLE_NOTIFICATION_TEST,
      page: 1,
      taillePage: 20,
    });
    assert.equal(apresReprise.elements.some(
      (element) => element.identifiantNotification === 'notification-dead-letter-postgres',
    ), false);
  } finally {
    await pool.query('DELETE FROM notifications_dead_letters WHERE job_id = $1', [identifiantJob]);
    await pool.end();
  }
});
