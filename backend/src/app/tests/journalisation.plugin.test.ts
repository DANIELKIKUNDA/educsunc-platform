import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import test from 'node:test';
import Fastify from 'fastify';
import pino from 'pino';

import { journalisationPlugin } from '../plugins/journalisation.plugin';
import {
  creerConfigurationPino,
  JournaliseurPino,
} from '../../shared/infrastructure/logger/PinoLogger';

function creerCollecteurLogs() {
  const lignes: Record<string, unknown>[] = [];
  let tampon = '';
  const flux = new Writable({
    write(fragment, _encodage, terminer) {
      tampon += fragment.toString();
      const morceaux = tampon.split('\n');
      tampon = morceaux.pop() ?? '';
      for (const ligne of morceaux) {
        if (ligne.trim()) {
          lignes.push(JSON.parse(ligne) as Record<string, unknown>);
        }
      }
      terminer();
    },
  });

  return { flux, lignes };
}

test('Pino masque les secrets et conserve le contexte du service', () => {
  const collecteur = creerCollecteurLogs();
  const logger = pino(creerConfigurationPino(), collecteur.flux);

  new JournaliseurPino(logger).info(
    'Verification du masquage.',
    {
      token: 'secret-token-visible-interdit',
      headers: { authorization: 'Bearer secret-authorization-interdit' },
      metadata: { refreshToken: 'secret-imbrique-interdit' },
    },
  );

  const sortie = JSON.stringify(collecteur.lignes);
  assert.doesNotMatch(sortie, /secret-token-visible-interdit/u);
  assert.doesNotMatch(sortie, /secret-authorization-interdit/u);
  assert.doesNotMatch(sortie, /secret-imbrique-interdit/u);
  assert.match(sortie, /\[MASQUE\]/u);
  assert.match(sortie, /EducSyn API/u);
});

test('la journalisation HTTP contient methode, route, statut et duree', async () => {
  const lignes: Record<string, unknown>[] = [];
  const serveur = Fastify({ logger: false });
  serveur.log.info = ((entree: Record<string, unknown>, message?: string) => {
    lignes.push({ ...entree, message });
  }) as typeof serveur.log.info;
  await journalisationPlugin(serveur, {});
  serveur.get('/journal-test/:id', async () => ({ ok: true }));

  try {
    const reponse = await serveur.inject({ method: 'GET', url: '/journal-test/42' });
    assert.equal(reponse.statusCode, 200);
    const entree = lignes.find(
      (ligne) => ligne.message === 'Traitement HTTP journalise.',
    );

    assert.ok(entree);
    assert.equal(entree.methode, 'GET');
    assert.equal(entree.route, '/journal-test/:id');
    assert.equal(entree.statut, 200);
    assert.equal(entree.service, 'edusync-backend');
    assert.equal(entree.composant, 'http');
    assert.equal(typeof entree.dureeMs, 'number');
    assert.equal('utilisateurId' in entree, false);
    assert.equal('organisationActiveId' in entree, false);
    assert.equal('ecoleActiveId' in entree, false);
  } finally {
    await serveur.close();
  }
});
