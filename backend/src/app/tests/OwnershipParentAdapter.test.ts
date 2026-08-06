import assert from 'node:assert/strict';
import test from 'node:test';
import { OwnershipParentAdapter } from '../adapters/OwnershipParentAdapter';
import type {
  ResultatExecutionSql,
  SqlQueryClient,
} from '../../shared/infrastructure/persistence/SqlQueryClient';

test("l ownership parent relit les eleves rattaches a la famille officielle", async () => {
  let requeteSql = '';
  let parametres: readonly unknown[] = [];
  const clientSql: SqlQueryClient = {
    async executer<TLigne extends object>(
      sql: string,
      valeurs: readonly unknown[] = [],
    ): Promise<ResultatExecutionSql<TLigne>> {
      requeteSql = sql;
      parametres = valeurs;
      return {
        lignes: [
          { id_eleve: '00000000-0000-5000-a000-000000000003' },
        ] as unknown as readonly TLigne[],
        nombreLignesAffectees: 1,
      };
    },
  };
  const adapter = new OwnershipParentAdapter(clientSql);

  const eleves = await adapter.listerElevesAutorises({
    idUtilisateur: '00000000-0000-5000-a000-000000000004',
    idEcole: '00000000-0000-5000-a000-000000000002',
  });

  assert.deepEqual(eleves, ['00000000-0000-5000-a000-000000000003']);
  assert.match(requeteSql, /JOIN eleves eleve ON eleve\.id_famille = famille\.id/);
  assert.doesNotMatch(requeteSql, /membres_famille/);
  assert.deepEqual(parametres, [
    '00000000-0000-5000-a000-000000000002',
    '00000000-0000-5000-a000-000000000004',
  ]);
});
