import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuditEntry } from 'shared/audit/domain/aggregates';
import type { AuditCanonicalWritePort } from 'shared/audit/application/ports/outbound';
import type { AuditCanonicalWriteResult } from 'shared/audit/application/outbox';
import { CanonicalAuditProducer } from 'shared/audit/infrastructure/producers';
import { BulletinAuditAdapter } from '../../../infrastructure/adapters/BulletinAuditAdapter';

class WriterMemoire implements AuditCanonicalWritePort {
  public entree?: AuditEntry;
  public async ecrire(entree: AuditEntry): Promise<AuditCanonicalWriteResult> {
    this.entree = entree;
    return { duplicate: false, eventId: entree.obtenirId(), idOutbox: 'outbox-1' };
  }
}

test('l encodage de cote devient une entree canonique tenant ecole', async () => {
  const writer = new WriterMemoire();
  const adapter = new BulletinAuditAdapter(new CanonicalAuditProducer(writer));
  await adapter.journaliser({
    action: 'ENCODER_COTE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'enseignant-1',
    referenceMetier: 'fiche-1',
    operationId: 'P1:1',
    details: { codeColonne: 'P1', accessToken: 'interdit' },
  });

  assert.equal(writer.entree?.obtenirActionAudit().obtenirValeur(), 'COTE_ENCODEE');
  assert.equal(writer.entree?.obtenirTenantAudit().obtenirOrganisationId(), 'org-1');
  assert.equal(writer.entree?.obtenirTenantAudit().obtenirEcoleId(), 'ecole-1');
  assert.equal(writer.entree?.obtenirRessourceAudit().obtenirIdentifiantRessource().obtenirValeur(), 'fiche-1');
});

test('aucune entree incomplete n est produite sans organisation', async () => {
  const writer = new WriterMemoire();
  const adapter = new BulletinAuditAdapter(new CanonicalAuditProducer(writer));
  await adapter.journaliser({
    action: 'ENCODER_COTE',
    idEcole: 'ecole-1',
    idUtilisateur: 'enseignant-1',
    referenceMetier: 'fiche-1',
  });
  assert.equal(writer.entree, undefined);
});

test('la generation de proclamation devient une entree canonique tenant ecole', async () => {
  const writer = new WriterMemoire();
  const adapter = new BulletinAuditAdapter(new CanonicalAuditProducer(writer));

  await adapter.journaliser({
    action: 'GENERER_PROCLAMATION',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'prefet-1',
    referenceMetier: 'proclamation-1',
    operationId: 'EX1:EXAMEN',
  });

  assert.equal(writer.entree?.obtenirActionAudit().obtenirValeur(), 'PROCLAMATION_GENEREE');
  assert.equal(
    writer.entree?.obtenirRessourceAudit().obtenirTypeRessource().obtenirValeur(),
    'PROCLAMATION',
  );
  assert.equal(writer.entree?.obtenirTenantAudit().obtenirOrganisationId(), 'org-1');
  assert.equal(writer.entree?.obtenirTenantAudit().obtenirEcoleId(), 'ecole-1');
});
