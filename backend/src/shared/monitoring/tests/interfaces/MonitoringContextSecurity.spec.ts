import assert from 'node:assert/strict';
import test from 'node:test';
import { extraireContexteHttpMonitoring } from '../../interfaces/http/controllers/MonitoringControllerSupport';

test('Monitoring refuse qu un client remplace le tenant authentifie par query ou body', () => {
  const contexte = extraireContexteHttpMonitoring({
    context: {
      organisationActiveId: 'org-session',
      ecoleActiveId: 'ecole-session',
      utilisateurId: 'user-session',
    },
    query: {
      organisationId: 'org-forgee-query',
      ecoleId: 'ecole-forgee-query',
      utilisateurId: 'user-forge-query',
      module: 'api',
    },
    body: {
      contexte: {
        organisationId: 'org-forgee-body',
        ecoleId: 'ecole-forgee-body',
        utilisateurId: 'user-forge-body',
        composant: 'worker',
      },
    },
  });

  assert.equal(contexte.organisationId, 'org-session');
  assert.equal(contexte.ecoleId, 'ecole-session');
  assert.equal(contexte.utilisateurId, 'user-session');
  assert.equal(contexte.module, 'api');
  assert.equal(contexte.composant, 'worker');
});

test('Monitoring Plateforme fonctionne sans organisation ni ecole active', () => {
  const contexte = extraireContexteHttpMonitoring({
    context: { utilisateurId: 'manager-systeme' },
    query: {},
  });

  assert.equal(contexte.organisationId, undefined);
  assert.equal(contexte.ecoleId, undefined);
  assert.equal(contexte.utilisateurId, 'manager-systeme');
  assert.equal(contexte.module, 'shared-monitoring');
});
