import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ContenuNotification,
  DestinataireNotification,
  InformationsRetry,
  PolitiqueSecuriteContenu,
  SpecificationAudienceNotification,
  SpecificationRetryNotification,
  SpecificationSecuriteContenuNotification,
  SpecificationTransitionNotification,
} from 'shared/notifications/domain';

test('les specifications Notifications appliquent les gardes critiques attendues', () => {
  const destinataireHorsTenant = new DestinataireNotification(
    'dest-1',
    'USER',
    'DIRECT_TARGET',
    'PRIVATE',
    ['EMAIL'],
    'USER',
    'dest@test.local',
    'user-1',
    undefined,
    undefined,
    undefined,
    'ecole-1',
    'autre-org',
  );

  assert.equal(SpecificationTransitionNotification.estAutorisee('CREATED', 'VALIDATED'), true);
  assert.equal(SpecificationTransitionNotification.estAutorisee('SENT', 'CREATED'), false);
  assert.equal(
    SpecificationRetryNotification.estAutorise('FAILED', new InformationsRetry(2, 3), true),
    false,
  );
  assert.equal(
    SpecificationAudienceNotification.respecteIsolationTenant('org-1', 'ecole-1', [destinataireHorsTenant]),
    false,
  );
  assert.equal(
    SpecificationSecuriteContenuNotification.estValide(
      new ContenuNotification('ce message contient un secret-metier', 'titre'),
      new PolitiqueSecuriteContenu(['secret-metier']),
    ),
    false,
  );
});
