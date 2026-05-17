import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresBulletinEleveQuery } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresBulletinEleveQuery';
import { PostgresDepotBulletinEleve } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotBulletinEleve';
import { creerBulletin } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre les lectures rapides documentaires du BC.
test('la query de bulletin relit une projection cohérente apres sauvegarde', async () => {
  const depot = new PostgresDepotBulletinEleve();
  const bulletin = creerBulletin();
  await depot.sauvegarder(bulletin);

  const query = new PostgresBulletinEleveQuery();
  const readModel = await query.executer('eleve-1', 'annee-1');
  assert.ok(readModel !== null);
  assert.equal(readModel?.idEleve, 'eleve-1');
  assert.equal(readModel?.versionBulletin, bulletin.obtenirVersionBulletin());
});
