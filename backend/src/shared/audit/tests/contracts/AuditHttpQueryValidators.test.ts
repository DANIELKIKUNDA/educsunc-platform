import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AuditHistoryValidator,
  AuditListValidator,
} from '../../interfaces/http/validators';

test('la pagination Audit accepte les entiers transmis par une vraie query HTTP', () => {
  const query = AuditListValidator.valider({
    page: '2',
    taillePage: '50',
  });

  assert.equal(query.page, 2);
  assert.equal(query.taillePage, 50);
});

test('la pagination Audit refuse une chaine qui n est pas un entier canonique', () => {
  assert.throws(
    () => AuditListValidator.valider({ page: '1.5', taillePage: '50' }),
    /page doit/,
  );
});

test('l historique plateforme peut etre ouvert avant l application d un filtre', () => {
  const query = AuditHistoryValidator.valider({
    page: '1',
    taillePage: '50',
  });

  assert.equal(query.page, 1);
  assert.equal(query.taillePage, 50);
  assert.equal(query.acteurId, undefined);
  assert.equal(query.ressourceId, undefined);
});

test('la lecture Audit valide les filtres temporels et le curseur opaque', () => {
  const query = AuditListValidator.valider({
    taillePage: '100',
    cursor: 'YWJjZA',
    dateDebut: '2026-01-01T00:00:00.000Z',
    dateFin: '2026-12-31T23:59:59.999Z',
    requestId: 'request-l3',
  });

  assert.equal(query.taillePage, 100);
  assert.equal(query.cursor, 'YWJjZA');
  assert.equal(query.requestId, 'request-l3');
});

test('la lecture Audit refuse un curseur trop long ou non opaque', () => {
  assert.throws(() => AuditListValidator.valider({ cursor: 'a'.repeat(1_025) }), /cursor/);
  assert.throws(() => AuditListValidator.valider({ cursor: 'cursor avec espaces' }), /cursor/);
});
