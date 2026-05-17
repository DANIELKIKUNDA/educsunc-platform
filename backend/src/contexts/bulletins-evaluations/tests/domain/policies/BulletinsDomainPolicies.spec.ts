import test from 'node:test';
import assert from 'node:assert/strict';
import { PolicyAbandonProclamation } from 'contexts/bulletins-evaluations/domain/policies/PolicyAbandonProclamation';
import { PolicyClassementParColonne } from 'contexts/bulletins-evaluations/domain/policies/PolicyClassementParColonne';
import { PolicyConduiteParPeriode } from 'contexts/bulletins-evaluations/domain/policies/PolicyConduiteParPeriode';
import { PolicyMigrationBulletin } from 'contexts/bulletins-evaluations/domain/policies/PolicyMigrationBulletin';
import { PolicyNonClasse } from 'contexts/bulletins-evaluations/domain/policies/PolicyNonClasse';
import { PolicySuppressionPhysiqueInterdite } from 'contexts/bulletins-evaluations/domain/policies/PolicySuppressionPhysiqueInterdite';

// Ce fichier couvre les decisions metier transverses portees par les policies.
test('les policies renvoient ou protegent les decisions attendues', () => {
  assert.equal(new PolicyNonClasse().verifier(true), true);
  assert.doesNotThrow(() => new PolicyClassementParColonne().verifier(true));
  assert.doesNotThrow(() => new PolicyConduiteParPeriode().verifier(CodePeriodeSimple.P1, 100));
  assert.equal(new PolicyAbandonProclamation().exclureDuClassement(StatutProclamationEleve.ABANDON), true);
  assert.doesNotThrow(() => new PolicyMigrationBulletin().verifier('v1', 'v2'));
  assert.throws(() => new PolicySuppressionPhysiqueInterdite().interdire());
});
import { CodePeriodeSimple } from 'contexts/bulletins-evaluations/domain/value-objects/CodePeriodeSimple';
import { StatutProclamationEleve } from 'contexts/bulletins-evaluations/domain/value-objects/StatutProclamationEleve';
