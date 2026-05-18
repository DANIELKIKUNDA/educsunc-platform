import test from 'node:test';
import assert from 'node:assert/strict';
import { PourcentageBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/PourcentageBulletin';

// Ce fichier couvre les nouvelles regles d'affichage du pourcentage officiel.
test('le pourcentage officiel garde une decimale et reste borne', () => {
  const pourcentage = new PourcentageBulletin(75.36);

  assert.equal(pourcentage.obtenirValeur(), 75.4);
  assert.equal(pourcentage.obtenirAffichageOfficiel(), '75,4 %');
});
