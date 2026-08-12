import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuditEntry } from 'shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from 'shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from 'shared/audit/application/outbox';
import { CanonicalAuditProducer } from 'shared/audit/infrastructure/producers';
import { SecurityAuditAdapter } from '../../infrastructure/adapters/security/SecurityAuditAdapter';

class WriterMemoire implements AuditCanonicalWritePort {
  public readonly entrees: AuditEntry[] = [];
  public async ecrire(entree: AuditEntry): Promise<AuditCanonicalWriteResult> {
    this.entrees.push(entree);
    return { duplicate: false, eventId: entree.obtenirId(), idOutbox: 'outbox-auth' };
  }
}

test('Auth raccorde login, logout et revocation aux actions officielles', async () => {
  const writer = new WriterMemoire();
  const adapter = new SecurityAuditAdapter(undefined, new CanonicalAuditProducer(writer));

  await adapter.journaliserConnexion({
    utilisateurId: 'user-1',
    sessionId: 'session-1',
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
    estOffline: false,
  });
  await adapter.publierAuditSecurite({
    action: 'AUTH_LOGOUT',
    utilisateurId: 'user-1',
    succes: true,
    details: { sessionId: 'session-1' },
  });
  await adapter.publierAuditSecurite({
    action: 'AUTH_REFRESH_REPLAY',
    utilisateurId: 'user-1',
    succes: false,
    details: { sessionId: 'session-2' },
  });

  assert.deepEqual(
    writer.entrees.map((entree) => entree.obtenirActionAudit().obtenirValeur()),
    ['LOGIN_REUSSI', 'LOGOUT', 'SESSION_REVOQUEE'],
  );
  assert.equal(writer.entrees[0]?.obtenirTenantAudit().obtenirEcoleId(), 'ecole-1');
});

test('une action Auth sans equivalent officiel ne cree pas de faux audit', async () => {
  const writer = new WriterMemoire();
  const adapter = new SecurityAuditAdapter(undefined, new CanonicalAuditProducer(writer));
  await adapter.publierAuditSecurite({ action: 'AUTH_REFRESH', utilisateurId: 'user-1', succes: true });
  assert.equal(writer.entrees.length, 0);
});
