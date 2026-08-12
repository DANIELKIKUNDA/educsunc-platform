import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuditEntry } from 'shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from 'shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from 'shared/audit/application/outbox';
import { CanonicalAuditProducer } from 'shared/audit/infrastructure/producers';
import type { SqlQueryClient } from 'shared/infrastructure/persistence/SqlQueryClient';
import { SecurityAuditInfrastructureService } from 'shared/security/infrastructure/services/SecurityAuditInfrastructureService';

class WriterMemoire implements AuditCanonicalWritePort {
  public readonly entrees: AuditEntry[] = [];
  public async ecrire(entree: AuditEntry): Promise<AuditCanonicalWriteResult> {
    this.entrees.push(entree);
    return { duplicate: false, eventId: entree.obtenirId(), idOutbox: 'outbox-security' };
  }
}

const clientLecture: SqlQueryClient = {
  executer: async () => ({ lignes: [], nombreLignesAffectees: 0 }),
};

test('Security raccorde le refus et une mutation de gouvernance sans insert direct', async () => {
  const writer = new WriterMemoire();
  const service = new SecurityAuditInfrastructureService(
    clientLecture,
    new CanonicalAuditProducer(writer),
  );
  await service.journaliser({
    action: 'SECURITY_PERMISSION_DENIED',
    idUtilisateur: 'user-1',
    succes: false,
    details: { organisationId: 'org-1', niveauScope: 'ORGANISATION', accessToken: 'interdit' },
  });
  await service.journaliser({
    action: 'ROLE_PERSONNALISE_CREE',
    idUtilisateur: 'manager-1',
    succes: true,
    details: { cibleId: 'role-1', niveauScope: 'PLATEFORME', password: 'interdit' },
  });

  assert.deepEqual(
    writer.entrees.map((entree) => entree.obtenirActionAudit().obtenirValeur()),
    ['ACCES_REFUSE', 'GOUVERNANCE_SECURITE_MODIFIEE'],
  );
  assert.equal(writer.entrees[0]?.obtenirTenantAudit().obtenirOrganisationId(), 'org-1');
});

test('les autorisations positives de lecture ne gonflent pas le registre Audit', async () => {
  const writer = new WriterMemoire();
  const service = new SecurityAuditInfrastructureService(
    clientLecture,
    new CanonicalAuditProducer(writer),
  );
  await service.journaliser({ action: 'SECURITY_PERMISSION_GRANTED', succes: true });
  await service.journaliser({ action: 'SECURITY_SCOPE_GRANTED', succes: true });
  assert.equal(writer.entrees.length, 0);
});
