import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { creerClassement, creerLigneClassement } from '../factories/BulletinsEvaluationsFactories';

// Ce fichier pose un garde-fou simple sur les operations critiques de classement local.
test('le recalcul de classement local reste rapide sur un jeu de donnees large', () => {
  const classement = creerClassement();
  const lignes = Array.from({ length: 1500 }, (_, index) =>
    creerLigneClassement({
      totalObtenu: 1500 - index,
      maximumGeneral: 2000,
      pourcentage: Number((((1500 - index) / 2000) * 100).toFixed(2)),
      rang: index + 1,
    }));

  const debut = performance.now();
  classement.recalculerClassement(lignes);
  const duree = performance.now() - debut;
  assert.equal(classement.obtenirLignesClassement().length, 1500);
  assert.ok(duree < 1000);
});
