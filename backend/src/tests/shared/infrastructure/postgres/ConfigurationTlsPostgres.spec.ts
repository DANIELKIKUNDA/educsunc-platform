import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { creerConfigurationTlsPostgres } from '../../../../shared/infrastructure/postgres/ConfigurationTlsPostgres';

describe('Configuration TLS PostgreSQL', () => {
  it('ne configure pas TLS lorsqu il est desactive', () => {
    assert.equal(creerConfigurationTlsPostgres(false), undefined);
  });

  it('verifie toujours le certificat lorsque TLS est actif', () => {
    assert.deepEqual(creerConfigurationTlsPostgres(true, undefined), {
      rejectUnauthorized: true,
    });
  });

  it('normalise une autorite de certification fournie par variable d environnement', () => {
    assert.deepEqual(creerConfigurationTlsPostgres(true, 'CERTIFICAT\\nRACINE'), {
      rejectUnauthorized: true,
      ca: 'CERTIFICAT\nRACINE',
    });
  });
});
