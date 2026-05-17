import test from 'node:test';
import assert from 'node:assert/strict';
import { ErreurCoteDecimaleInterdite } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurCoteDecimaleInterdite';
import { ErreurCoteNegativeInterdite } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurCoteNegativeInterdite';
import { ErreurPourcentageInvalide } from 'contexts/bulletins-evaluations/domain/exceptions/ErreurPourcentageInvalide';
import { CodeColonneBulletin, estColonneExamenBulletin, estColonneTotalBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CoteEntiereNaturelle } from 'contexts/bulletins-evaluations/domain/value-objects/CoteEntiereNaturelle';
import { MentionBulletin, calculerMentionBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/MentionBulletin';
import { PourcentageBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/PourcentageBulletin';
import { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';

// Ce fichier couvre les regles documentaires des principaux value objects du BC.
test('les value objects appliquent les baremes et restrictions attendus', () => {
  assert.equal(calculerMentionBulletin(39), MentionBulletin.MA);
  assert.equal(calculerMentionBulletin(40), MentionBulletin.ME);
  assert.equal(calculerMentionBulletin(50), MentionBulletin.AB);
  assert.equal(calculerMentionBulletin(60), MentionBulletin.B);
  assert.equal(calculerMentionBulletin(70), MentionBulletin.TB);
  assert.equal(calculerMentionBulletin(80), MentionBulletin.E);

  assert.equal(new CoteEntiereNaturelle(10).obtenirValeur(), 10);
  assert.throws(() => new CoteEntiereNaturelle(10.5), ErreurCoteDecimaleInterdite);
  assert.throws(() => new CoteEntiereNaturelle(-1), ErreurCoteNegativeInterdite);
  assert.throws(() => new PourcentageBulletin(101), ErreurPourcentageInvalide);

  assert.equal(estColonneTotalBulletin(CodeColonneBulletin.TOTAL_GENERAL), true);
  assert.equal(estColonneExamenBulletin(CodeColonneBulletin.EX1), true);
  assert.equal(TypeStructureEvaluation.SEMESTRIEL, 'SEMESTRIEL');
  assert.equal(StatutProclamationEleve.CLASSE, 'CLASSE');
});
