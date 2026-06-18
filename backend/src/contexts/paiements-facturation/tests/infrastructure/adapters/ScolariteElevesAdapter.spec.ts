import assert from 'node:assert/strict';
import test from 'node:test';
import { ScolariteElevesAdapter } from '../../../infrastructure/adapters/ScolariteElevesAdapter';
import type {
  ResultatExecutionSql,
  SqlQueryClient,
} from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

class SqlQueryClientMemoire implements SqlQueryClient {
  public async executer<TLigne extends object>(): Promise<ResultatExecutionSql<TLigne>> {
    return {
      lignes: [{
        id_famille: 'FAM-001',
        id_ecole: 'ECOLE-001',
        nombre_enfants: '2',
        responsables: [{
          idResponsableFamille: 'RESP-001',
          idUtilisateurAuth: 'USER-PARENT-001',
          estPrincipal: true,
        }],
      }] as TLigne[],
      nombreLignesAffectees: 1,
    };
  }
}

test('ScolariteElevesAdapter expose les responsables auth d une famille eleve', async () => {
  const adaptateur = new ScolariteElevesAdapter(new SqlQueryClientMemoire());

  const famille = await adaptateur.consulterFamilleEleve('ELEVE-001');

  assert.deepEqual(famille, {
    idFamille: 'FAM-001',
    idEcole: 'ECOLE-001',
    nombreEnfants: 2,
    responsables: [{
      idResponsableFamille: 'RESP-001',
      idUtilisateurAuth: 'USER-PARENT-001',
      estPrincipal: true,
    }],
  });
});
