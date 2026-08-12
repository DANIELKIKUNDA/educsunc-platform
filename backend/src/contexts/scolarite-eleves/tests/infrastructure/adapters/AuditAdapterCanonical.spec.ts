import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuditEntry } from 'shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from 'shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from 'shared/audit/application/outbox';
import { CanonicalAuditProducer } from 'shared/audit/infrastructure/producers';
import { AuditAdapter } from '../../../infrastructure/adapters/AuditAdapter';

class WriterMemoire implements AuditCanonicalWritePort {
  public entree?: AuditEntry;
  public async ecrire(entree: AuditEntry): Promise<AuditCanonicalWriteResult> {
    this.entree = entree;
    return { duplicate: false, eventId: entree.obtenirId(), idOutbox: 'outbox-scolarite' };
  }
}

test('l abandon conserve le tenant ecole et l acteur dans le registre canonique', async () => {
  const writer = new WriterMemoire();
  const adapter = new AuditAdapter(new CanonicalAuditProducer(writer));
  await adapter.journaliserAction({
    action: 'ABANDON_DECLARE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'caissier-1',
    referenceMetier: 'eleve-1',
  });
  assert.equal(writer.entree?.obtenirActionAudit().obtenirValeur(), 'ABANDON_DECLARE');
  assert.equal(writer.entree?.obtenirTenantAudit().obtenirOrganisationId(), 'org-1');
  assert.equal(writer.entree?.obtenirActeurAudit().obtenirIdUtilisateur(), 'caissier-1');
});
