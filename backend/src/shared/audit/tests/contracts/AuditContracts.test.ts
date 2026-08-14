import assert from 'node:assert/strict';
import test from 'node:test';
import { AuditJobFactory } from 'shared/audit/infrastructure/workers';
import {
  AuditConflictException,
  AuditForbiddenException,
  AuditNotFoundException,
  AuditValidationException,
} from 'shared/audit/application/exceptions/communes';
import { AuditErrorMiddleware } from 'shared/audit/interfaces/http/middlewares';
import type { FastifyRequest } from 'fastify';
import { reinitialiserEtatAuditTests } from '../support/AuditTestSupport';

test('les contrats workers conservent correlation tenant replay et retry metadata', () => {
  reinitialiserEtatAuditTests();
  const job = new AuditJobFactory().creer(
    'ReplayProjectionJob',
    'PROJECTIONS',
    { projection: 'timeline' },
    {
      correlationId: 'corr-contract',
      requestId: 'req-contract',
      organisationId: 'org-a',
      ecoleId: 'ecole-a',
      replayId: 'replay-contract',
      retryCount: 2,
    },
  );

  assert.equal(job.metadata.correlationId, 'corr-contract');
  assert.equal(job.metadata.requestId, 'req-contract');
  assert.equal(job.metadata.organisationId, 'org-a');
  assert.equal(job.metadata.ecoleId, 'ecole-a');
  assert.equal(job.metadata.replayId, 'replay-contract');
  assert.equal(job.metadata.retryCount, 2);
});

test('le middleware HTTP preserve les statuts des erreurs applicatives Audit', () => {
  const middleware = new AuditErrorMiddleware();
  const requete = { context: { requestId: 'req-contract', correlationId: 'corr-contract' }, headers: {} } as FastifyRequest;
  const scenarios = [
    [new AuditValidationException('Requete invalide.'), 400, 'AUDIT_VALIDATION_ERROR'],
    [new AuditForbiddenException('Acces refuse.'), 403, 'AUDIT_FORBIDDEN'],
    [new AuditNotFoundException('Evenement introuvable.'), 404, 'AUDIT_NOT_FOUND'],
    [new AuditConflictException('Conflit detecte.'), 409, 'AUDIT_CONFLICT'],
  ] as const;

  for (const [erreur, statutHttp, code] of scenarios) {
    const resultat = middleware.normaliser(erreur, requete);
    assert.equal(resultat.statutHttp, statutHttp);
    assert.equal((resultat.corps as { erreur: string }).erreur, code);
  }
});
