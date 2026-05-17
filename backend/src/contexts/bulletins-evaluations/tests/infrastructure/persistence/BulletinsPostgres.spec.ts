import test from 'node:test';
import assert from 'node:assert/strict';
import { migrationsPostgresBulletinsEvaluations } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/migrations';
import { PostgresDepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotFicheCotationEleveCours';
import { reinitialiserMemoireBulletins } from '../../shared/BulletinsEvaluationsTestUtils';
import { creerFicheCotation } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre le stockage documentaire local du BC et ses migrations.
test('les depots locaux relisent fidelement les agregats et les migrations sont exposees', async () => {
  reinitialiserMemoireBulletins();
  const depot = new PostgresDepotFicheCotationEleveCours();
  const fiche = creerFicheCotation();
  await depot.sauvegarder(fiche);

  assert.equal(await depot.existeFichePourEleveCoursAnnee('eleve-1', 'cours-1', 'annee-1'), true);
  assert.equal((await depot.listerParEleve('eleve-1', 'annee-1')).length >= 1, true);
  assert.equal(migrationsPostgresBulletinsEvaluations.length >= 12, true);
  assert.ok(migrationsPostgresBulletinsEvaluations[0].sql.length > 0);
});
