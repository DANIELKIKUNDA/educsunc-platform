import test from 'node:test';
import assert from 'node:assert/strict';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../domain/value-objects/Money';
import { SyntheseFinanciereOrganisationQueryRepository } from '../../../infrastructure/persistence/postgres/queries/SyntheseFinanciereOrganisationQueryRepository';

class SqlQueryClientMemoire implements SqlQueryClient {
  public async executer<T extends object = Record<string, unknown>>(): Promise<{
    lignes: T[];
    nombreLignesAffectees: number;
  }> {
    return {
      lignes: [
        { id: 'ECOLE-A', nom: 'Ecole A' },
        { id: 'ECOLE-B', nom: 'Ecole B' },
      ] as T[],
      nombreLignesAffectees: 2,
    };
  }
}

class SyntheseEcoleMemoire {
  public async consulterSyntheseEcole(params: { idEcole: string }) {
    const estA = params.idEcole === 'ECOLE-A';
    return {
      totalGeneralEcole: {
        effectifTotal: estA ? 40 : 30,
        elevesRedevables: estA ? 32 : 25,
        elevesEnOrdre: estA ? 20 : 15,
        elevesNonEnOrdre: estA ? 12 : 10,
        montantAttendu: new Money(estA ? 5000 : 4000, 'CDF'),
        montantPaye: new Money(estA ? 3000 : 2500, 'CDF'),
        resteARecouvrer: new Money(estA ? 2000 : 1500, 'CDF'),
        tauxRecouvrement: estA ? 60 : 62.5,
      },
    };
  }
}

test('SyntheseFinanciereOrganisationQueryRepository consolide les ecoles d une organisation', async () => {
  const repository = new SyntheseFinanciereOrganisationQueryRepository(
    new SqlQueryClientMemoire(),
    new SyntheseEcoleMemoire() as never,
  );

  const lecture = await repository.consulterSyntheseOrganisation({
    idOrganisation: 'ORG-001',
    idAnneeScolaire: 'ANNEE-001',
  });

  assert.equal(lecture.lignes.length, 2);
  assert.equal(lecture.totalGeneralOrganisation.effectifTotal, 70);
  assert.equal(lecture.totalGeneralOrganisation.elevesRedevables, 57);
  assert.equal(lecture.totalGeneralOrganisation.resteARecouvrer.obtenirMontant(), 3500);
});
