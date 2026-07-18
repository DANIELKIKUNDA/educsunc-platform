import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoireAffectationTestRepository } from '../support/SecurityMemoryTestRepositories';
import { creerAffectationUtilisateur, reinitialiserMemoireSecurity } from '../support/SecurityTestSupport';

test('save affectation, update affectation et find affectations utilisateur', async () => {
  reinitialiserMemoireSecurity();
  const repository = new MemoireAffectationTestRepository();
  const affectation = creerAffectationUtilisateur();
  await repository.sauvegarder(affectation);

  let liste = await repository.listerActivesParUtilisateur('utilisateur-1');
  assert.equal(liste.length, 1);

  affectation.desactiver();
  await repository.sauvegarder(affectation);
  const trouvee = await repository.trouverParId(affectation.obtenirId());
  assert.equal(trouvee?.obtenirEtatAffectation().obtenirValeur(), 'INACTIVE');

  liste = await repository.listerActivesParUtilisateur('utilisateur-1');
  assert.equal(liste.length, 0);
});
