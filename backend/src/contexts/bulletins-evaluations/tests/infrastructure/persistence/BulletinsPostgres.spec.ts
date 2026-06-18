import test from 'node:test';
import assert from 'node:assert/strict';
import { migrationsPostgresBulletinsEvaluations } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/migrations';
import { PostgresDepotClassementColonneClasse } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotClassementColonneClasse';
import { PostgresDepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotFicheCotationEleveCours';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { reinitialiserMemoireBulletins } from '../../shared/BulletinsEvaluationsTestUtils';
import { creerClassement, creerFicheCotation, creerLigneClassement } from '../../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre le stockage documentaire local du BC et ses migrations.
test('les depots locaux relisent fidelement les agregats et les migrations sont exposees', async () => {
  reinitialiserMemoireBulletins();
  const depot = new PostgresDepotFicheCotationEleveCours();
  const depotClassement = new PostgresDepotClassementColonneClasse();
  const fiche = creerFicheCotation();
  const classement = creerClassement({
    idClassementColonneClasse: 'classement-persistance-1',
    idClassePedagogique: 'classe-persistance-1',
    idAnneeScolaire: 'annee-persistance-1',
    codeColonne: CodeColonneBulletin.TOTAL_GENERAL,
    lignesClassement: [
      creerLigneClassement({
        idLigneClassementEleve: 'ligne-persistance-1',
        idEleve: 'eleve-persistance-1',
        rang: 1,
      }),
    ],
  });
  await depot.sauvegarder(fiche);
  await depotClassement.sauvegarder(classement);

  assert.equal(await depot.existeFichePourEleveCoursAnnee('eleve-1', 'cours-1', 'annee-1'), true);
  assert.equal((await depot.listerParEleve('eleve-1', 'annee-1')).length >= 1, true);
  assert.equal(
    (await depotClassement.trouverParClasseEtColonne(
      'classe-persistance-1',
      CodeColonneBulletin.TOTAL_GENERAL,
      'annee-persistance-1',
    ))?.obtenirLignesClassement()[0]?.obtenirIdEleve(),
    'eleve-persistance-1',
  );
  assert.equal(migrationsPostgresBulletinsEvaluations.length >= 12, true);
  assert.ok(migrationsPostgresBulletinsEvaluations[0].sql.length > 0);
});
