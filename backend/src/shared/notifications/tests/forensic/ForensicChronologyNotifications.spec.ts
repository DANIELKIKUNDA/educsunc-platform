import assert from 'node:assert/strict';
import test from 'node:test';
import { RuntimeNotificationFactory } from '../factories/RuntimeNotificationFactory';
import { NotificationsTestSupport } from '../support/NotificationsTestSupport';

test('l archivage produit une vue forensic coherente avec chronology retry et replay', async () => {
  const environnement = NotificationsTestSupport.creerEnvironnement();
  const enregistrement = RuntimeNotificationFactory.creerEnregistrement({
    identifiant: 'notification-forensic',
    statut: 'ARCHIVED',
    compteurRetry: 2,
  });

  environnement.registreNotificationsMemoire.enregistrements.set(enregistrement.identifiant, enregistrement);
  environnement.registreNotificationsMemoire.projectionsChronologie.set(enregistrement.identifiant, [
    {
      identifiant: 'ligne-1',
      identifiantNotification: enregistrement.identifiant,
      typeEvenement: 'CREATED',
      statutAvant: undefined,
      statutApres: 'CREATED',
      horodatage: new Date(),
      granularite: 'FORENSIC',
      appendOnly: true,
      metadonnees: {},
    },
    {
      identifiant: 'ligne-2',
      identifiantNotification: enregistrement.identifiant,
      typeEvenement: 'ARCHIVED',
      statutAvant: 'SENT',
      statutApres: 'ARCHIVED',
      horodatage: new Date(),
      granularite: 'FORENSIC',
      appendOnly: true,
      metadonnees: {},
    },
  ]);

  const replay = environnement.stockageReplayNotification.ouvrir(enregistrement.identifiant, {
    raison: 'verification-forensic',
  });
  environnement.stockageReplayNotification.terminer(enregistrement.identifiant, replay.identifiantReplay, true);

  const resultat = await environnement.workerArchivageNotification.executerCycle();
  const forensic = environnement.stockageForensicNotifications.lire(enregistrement.identifiant);

  assert.equal(resultat.succes, true);
  assert.ok(forensic);
  assert.equal(forensic?.chronologyCount, 2);
  assert.equal(forensic?.totalRetries, 2);
  assert.equal(forensic?.totalReplays, 1);
});
