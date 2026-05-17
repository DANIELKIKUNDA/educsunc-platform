import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerBulletinsRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/bulletins.routes';

// Ce fichier simule un workflow HTTP simple du point de vue d'un client.
test('le workflow HTTP minimal de consultation d un bulletin fonctionne', async () => {
  const serveur = Fastify();
  await serveur.register(creerBulletinsRoutes({
    bulletinsController: {
      async generer() { return { donnee: { ok: true } }; },
      async consulter() { return { donnee: { idBulletinEleve: 'bulletin-1', idEleve: 'eleve-1' } }; },
      async telechargerPdf() { return { donnee: { format: 'pdf' } }; },
      async consulterHistorique() { return { donnee: [] }; },
    } as never,
  } as never));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/bulletins/eleve-1/annee-1',
  });
  assert.equal(reponse.statusCode, 200);
  assert.equal(reponse.json().donnee.idEleve, 'eleve-1');
  await serveur.close();
});
