import test from 'node:test';
import assert from 'node:assert/strict';
import { ValidationError } from 'shared/exceptions/ValidationError';
import { EncoderCoteValidator } from 'contexts/bulletins-evaluations/interfaces/http/validators/EncoderCoteValidator';
import { PaginationValidator } from 'contexts/bulletins-evaluations/interfaces/http/validators/PaginationValidator';
import { SecurityValidator } from 'contexts/bulletins-evaluations/interfaces/http/validators/SecurityValidator';

// Ce fichier couvre les validateurs HTTP les plus exposes du BC.
test('les validateurs acceptent les payloads valides et rejettent les invalides', () => {
  const encoder = EncoderCoteValidator.valider({
    idFicheCotationEleveCours: 'fiche-1',
    codeColonne: 'P1',
    cote: 8,
    versionAttendue: 1,
  }, {
    'x-user-id': 'user-1',
  });
  assert.equal(encoder.idUtilisateur, 'user-1');

  assert.throws(() => EncoderCoteValidator.valider({}, {}), ValidationError);

  const pagination = PaginationValidator.valider({ page: '2', limit: '25' });
  assert.equal(pagination.page, 2);
  assert.equal(pagination.limit, 25);

  const securite = SecurityValidator.valider({
    'x-user-id': 'user-1',
    'x-role': 'ADMIN',
    'x-scope': 'lecture',
  });
  assert.equal(securite.role, 'ADMIN');
});
