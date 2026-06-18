import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OrchestrateurCreationNotification,
  OrchestrateurReplayNotification,
  OrchestrateurRetryNotification,
} from 'shared/notifications/application';
import { NotificationFactory } from '../factories/NotificationFactory';
import { CommandeNotificationFactory } from '../factories/CommandeNotificationFactory';

test('les orchestrateurs creation, replay et retry pilotent leurs ports techniques', async () => {
  const notificationCreation = NotificationFactory.creer();
  const appelsTechnique: string[] = [];
  const audits: string[] = [];
  const signaux: string[] = [];
  const dispatches: string[] = [];
  const replays: string[] = [];
  const retries: string[] = [];

  const serviceCreation = {
    creerDepuisCommande: async () => notificationCreation,
    sauvegarderEtPublier: async () => undefined,
  } as unknown;

  const orchestrateurCreation = new OrchestrateurCreationNotification(
    serviceCreation as never,
    {
      ajouter: async (id) => {
        dispatches.push(id);
      },
    },
    {
      estDejaTraitee: async () => false,
      enregistrerTraitement: async () => undefined,
    } as never,
    {
      enregistrerSignal: async (nom) => {
        signaux.push(nom);
      },
    },
    {
      enregistrer: async (nom) => {
        audits.push(nom);
      },
    },
    {
      lire: async <T>(_cle: string, fallback: T) => fallback,
    } as never,
  );

  await orchestrateurCreation.executer(
    CommandeNotificationFactory.creer({
      idempotencyKey: 'idem-1',
    }) as never,
  );

  const notificationTechnique = {
    demarrerReplay: () => {
      appelsTechnique.push('replay');
    },
    planifierRetry: () => {
      appelsTechnique.push('planifier-retry');
    },
    demarrerRetry: () => {
      appelsTechnique.push('demarrer-retry');
    },
  };

  const serviceSuite = {
    chargerNotificationExigee: async () => notificationTechnique,
    sauvegarderEtPublier: async () => undefined,
  } as unknown;

  await new OrchestrateurReplayNotification(
    serviceSuite as never,
    {
      ajouter: async (id) => {
        replays.push(id);
      },
    },
    {
      enregistrer: async (nom) => {
        audits.push(nom);
      },
    },
    {
      enregistrerSignal: async (nom) => {
        signaux.push(nom);
      },
    },
  ).executer({
    identifiantNotification: notificationCreation.obtenirIdentifiant().obtenirValeur(),
    raison: 'test-replay',
  });

  await new OrchestrateurRetryNotification(
    serviceSuite as never,
    {
      ajouter: async (id) => {
        retries.push(id);
      },
    },
    {
      enregistrer: async (nom) => {
        audits.push(nom);
      },
    },
    {
      enregistrerSignal: async (nom) => {
        signaux.push(nom);
      },
    },
  ).executer({
    identifiantNotification: notificationCreation.obtenirIdentifiant().obtenirValeur(),
    raison: 'test-retry',
    action: 'PLANIFIER',
  });

  assert.equal(dispatches.length, 1);
  assert.equal(replays.length, 1);
  assert.equal(retries.length, 1);
  assert.ok(audits.includes('notification.creation'));
  assert.ok(audits.includes('notification.replay'));
  assert.ok(audits.includes('notification.retry'));
  assert.ok(signaux.includes('notifications.created'));
  assert.deepEqual(appelsTechnique, ['replay', 'planifier-retry', 'demarrer-retry']);
});
