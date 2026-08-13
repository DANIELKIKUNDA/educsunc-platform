import assert from 'node:assert/strict';
import test from 'node:test';
import type { SqlQueryClient } from '../../../infrastructure/persistence/SqlQueryClient';
import { calculerChecksumAudit, serialiserAuditCanoniquement } from '../../infrastructure/security/integrity/CanonicalAuditSerializer';
import { PostgresAuditIntegrityStore } from '../../infrastructure/security/integrity/PostgresAuditIntegrityStore';

test('la serialisation canonique est deterministe quel que soit l ordre des proprietes', () => {
  assert.equal(
    serialiserAuditCanoniquement({ b: 2, a: { y: 2, x: 1 } }),
    serialiserAuditCanoniquement({ a: { x: 1, y: 2 }, b: 2 }),
  );
  assert.equal(calculerChecksumAudit({ b: 2, a: 1 }), calculerChecksumAudit({ a: 1, b: 2 }));
});

test('une alteration apres scellement est detectee', async () => {
  const original = { id_audit_entry: 'audit-a', action: 'LECTURE', metadata: { valeur: 1 }, categories: ['SECURITE'] };
  const checksum = calculerChecksumAudit(original);
  let lecture = 0;
  const sql: SqlQueryClient = {
    async executer<TLigne extends object>() {
      lecture += 1;
      if (lecture === 1) return { lignes: [{ ...original, metadata: { valeur: 2 } }] as unknown as readonly TLigne[], nombreLignesAffectees: 1 };
      return { lignes: [{ checksum }] as unknown as readonly TLigne[], nombreLignesAffectees: 1 };
    },
  };
  const resultat = await new PostgresAuditIntegrityStore(sql).verifier('audit-a');
  assert.equal(resultat.statut, 'CORRUPTED');
  assert.notEqual(resultat.checksumObserve, resultat.checksumAttendu);
});
