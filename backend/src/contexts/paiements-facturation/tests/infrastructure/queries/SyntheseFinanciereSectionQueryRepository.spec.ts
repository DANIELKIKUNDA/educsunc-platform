import test from 'node:test';
import assert from 'node:assert/strict';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../domain/value-objects/Money';
import { SyntheseFinanciereSectionQueryRepository } from '../../../infrastructure/persistence/postgres/queries/SyntheseFinanciereSectionQueryRepository';

class SqlQueryClientMemoire implements SqlQueryClient {
  public async executer<T extends object = Record<string, unknown>>(): Promise<{
    lignes: T[];
    nombreLignesAffectees: number;
  }> {
    return {
      lignes: [
        { id: 'CLASSE-A', libelle: '1A' },
        { id: 'CLASSE-B', libelle: '1B' },
      ] as T[],
      nombreLignesAffectees: 2,
    };
  }
}

class SyntheseClasseMemoire {
  public async consulterSyntheseClasse(params: { idClassePedagogique: string }) {
    const estA = params.idClassePedagogique === 'CLASSE-A';
    return {
      situationActuelle: {
        effectifTotal: estA ? 10 : 8,
        elevesRedevables: estA ? 7 : 6,
        elevesEnOrdre: estA ? 5 : 4,
        elevesNonEnOrdre: estA ? 2 : 2,
        montantAttendu: new Money(estA ? 1000 : 800, 'CDF'),
        montantPaye: new Money(estA ? 700 : 500, 'CDF'),
        resteARecouvrer: new Money(estA ? 300 : 300, 'CDF'),
        tauxRecouvrement: estA ? 70 : 62.5,
      },
    };
  }
}

test('SyntheseFinanciereSectionQueryRepository consolide les classes d une section', async () => {
  const repository = new SyntheseFinanciereSectionQueryRepository(
    new SqlQueryClientMemoire(),
    new SyntheseClasseMemoire() as never,
  );

  const lecture = await repository.consulterSyntheseSection({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
    idSectionScolaire: 'SECTION-001',
  });

  assert.equal(lecture.lignes.length, 2);
  assert.equal(lecture.totalGeneralSection.effectifTotal, 18);
  assert.equal(lecture.totalGeneralSection.elevesRedevables, 13);
  assert.equal(lecture.totalGeneralSection.resteARecouvrer.obtenirMontant(), 600);
});
