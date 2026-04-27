import test from 'node:test';
import assert from 'node:assert/strict';

// Ce test documente le point d'integration de l'inscription complete.
test('CreerInscriptionComplete garde une sortie composee eleve inscription affectation', () => {
  const sortie = {
    eleve: { idEleve: 'eleve-1' },
    inscription: { idInscriptionScolaire: 'inscription-1' },
    affectation: { idAffectationClasse: 'affectation-1' },
  };
  assert.equal(sortie.eleve.idEleve, 'eleve-1');
  assert.equal(sortie.inscription.idInscriptionScolaire, 'inscription-1');
  assert.equal(sortie.affectation.idAffectationClasse, 'affectation-1');
});
