import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  ResultatExecutionSql,
  SqlQueryClient,
} from '../../shared/infrastructure/persistence/SqlQueryClient';
import { VerificationRattachementEcoleOrganisationService } from '../services/VerificationRattachementEcoleOrganisationService';

test('verifie le rattachement dans le referentiel academique PostgreSQL', async () => {
  const appels: Array<{
    requeteSql: string;
    parametres: readonly unknown[];
  }> = [];
  const client: SqlQueryClient = {
    executer: async <TLigne extends object>(
      requeteSql: string,
      parametres: readonly unknown[] = [],
    ): Promise<ResultatExecutionSql<TLigne>> => {
      appels.push({ requeteSql, parametres });
      return {
        lignes: [{ existe: true }] as unknown as readonly TLigne[],
        nombreLignesAffectees: 1,
      };
    },
  };
  const service = new VerificationRattachementEcoleOrganisationService(client);

  assert.equal(
    await service.verifierRattachement({
      organisationId: 'organisation-a',
      ecoleId: 'ecole-a',
    }),
    true,
  );
  assert.match(appels[0].requeteSql, /FROM ecoles/);
  assert.deepEqual(appels[0].parametres, ['ecole-a', 'organisation-a']);
});

test('le mode memoire reste ferme sans amorcage explicite', async () => {
  const service = new VerificationRattachementEcoleOrganisationService();

  assert.equal(
    await service.verifierRattachement({
      organisationId: 'organisation-a',
      ecoleId: 'ecole-a',
    }),
    false,
  );

  service.enregistrerRattachement({
    organisationId: 'organisation-a',
    ecoleId: 'ecole-a',
  });

  assert.equal(
    await service.verifierRattachement({
      organisationId: 'organisation-a',
      ecoleId: 'ecole-a',
    }),
    true,
  );
  assert.equal(
    await service.verifierRattachement({
      organisationId: 'organisation-b',
      ecoleId: 'ecole-a',
    }),
    false,
  );
});
