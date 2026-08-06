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
