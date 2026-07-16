import test from 'node:test';
import assert from 'node:assert/strict';
import { RevoquerToutesSessionsUtilisateurUseCase } from 'shared/auth/application/use-cases/RevoquerToutesSessionsUtilisateurUseCase';
import { TransactionManagerMemoire, creerRepositoriesMemoire, creerSessionUtilisateur, creerUtilisateurAuth } from '../support/AuthTestSupport';

test('revoque toutes les sessions et invalide les JWT futurs', async () => {
  const repositories = creerRepositoriesMemoire();
  const utilisateur = creerUtilisateurAuth();
  const session1 = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId() });
  const session2 = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId() });
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await repositories.depotSessionUtilisateur.sauvegarder(session1);
  await repositories.depotSessionUtilisateur.sauvegarder(session2);

  const tokenVersionInitiale = utilisateur.obtenirTokenVersion().obtenirValeur();
  const useCase = new RevoquerToutesSessionsUtilisateurUseCase(
    new TransactionManagerMemoire(),
    repositories.depotUtilisateurAuth,
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
  );

  await useCase.executer({ utilisateurId: utilisateur.obtenirId() });

  const utilisateurMaj = await repositories.depotUtilisateurAuth.trouverParId(utilisateur.obtenirId());
  assert.ok(utilisateurMaj);
  assert.ok(utilisateurMaj!.obtenirTokenVersion().obtenirValeur() > tokenVersionInitiale);
  assert.equal(await repositories.depotSessionUtilisateur.trouverSessionActive(session1.obtenirId()), null);
  assert.equal(await repositories.depotSessionUtilisateur.trouverSessionActive(session2.obtenirId()), null);
});
