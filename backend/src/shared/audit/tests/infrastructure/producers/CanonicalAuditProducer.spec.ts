import assert from 'node:assert/strict';
import test from 'node:test';
import type { AuditEntry } from '../../../domain/aggregates';
import type { AuditCanonicalWritePort } from '../../../application/ports/outbound';
import type { AuditCanonicalWriteResult } from '../../../application/outbox';
import { AuditEntryPersistenceMapper } from '../../../infrastructure/persistence/postgres/mappers';
import { CanonicalAuditProducer } from '../../../infrastructure/producers';

class WriterMemoire implements AuditCanonicalWritePort {
  public entree?: AuditEntry;
  public cle?: string;

  public async ecrire(entree: AuditEntry, cle: string): Promise<AuditCanonicalWriteResult> {
    this.entree = entree;
    this.cle = cle;
    return { duplicate: false, eventId: entree.obtenirId(), idOutbox: 'outbox-test' };
  }
}

test('le producteur applique la matrice, le tenant et la redaction avant l outbox', async () => {
  const writer = new WriterMemoire();
  const producteur = new CanonicalAuditProducer(writer);

  await producteur.produire({
    action: 'CONFIGURATION_MODIFIEE',
    resultat: 'SUCCESS',
    acteur: { id: 'user-1', role: 'MANAGER_SYSTEME' },
    tenant: { scope: 'PLATEFORME' },
    ressource: { type: 'CONFIGURATION', id: 'config-1' },
    contexte: { correlationId: 'correlation-1', source: 'HTTP_API' },
    permissions: ['configuration.system.write'],
    nouvelEtat: {
      valeur: 30,
      accessToken: 'interdit',
      enfant: { PasswordHash: 'interdit', visible: true },
      liste: [{ refresh_token: 'interdit', nom: 'visible' }],
    },
    metadata: { cookie: 'interdit', origine: 'test' },
    idempotencyKey: 'test:configuration:1',
  });

  assert.ok(writer.entree);
  assert.equal(writer.cle, 'test:configuration:1');
  const { auditEntry } = AuditEntryPersistenceMapper.versRows(writer.entree);
  assert.equal(auditEntry.action, 'CONFIGURATION_MODIFIEE');
  assert.equal(auditEntry.scope, 'PLATEFORME');
  assert.equal(auditEntry.acteur_id, 'user-1');
  assert.deepEqual(auditEntry.nouvel_etat, {
    valeur: 30,
    enfant: { visible: true },
    liste: [{ nom: 'visible' }],
  });
  assert.deepEqual(auditEntry.metadata, { origine: 'test', sourceAuditOriginal: 'HTTP_API' });
});

test('la meme cle d idempotence produit le meme identifiant audit', async () => {
  const premierWriter = new WriterMemoire();
  const secondWriter = new WriterMemoire();
  const input = {
    action: 'ELEVE_INSCRIT' as const,
    resultat: 'SUCCESS' as const,
    acteur: { id: 'caissier-1' },
    tenant: { scope: 'ECOLE' as const, organisationId: 'org-1', ecoleId: 'ecole-1' },
    ressource: { type: 'INSCRIPTION' as const, id: 'inscription-1' },
    idempotencyKey: 'scolarite:inscription-1',
  };

  await new CanonicalAuditProducer(premierWriter).produire(input);
  await new CanonicalAuditProducer(secondWriter).produire(input);

  assert.equal(premierWriter.entree?.obtenirId(), secondWriter.entree?.obtenirId());
});
