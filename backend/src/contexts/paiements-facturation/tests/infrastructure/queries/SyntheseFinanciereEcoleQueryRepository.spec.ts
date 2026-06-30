import test from 'node:test';
import assert from 'node:assert/strict';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { Money } from '../../../domain/value-objects/Money';
import { SyntheseFinanciereEcoleQueryRepository } from '../../../infrastructure/persistence/postgres/queries/SyntheseFinanciereEcoleQueryRepository';

class SqlQueryClientMemoire implements SqlQueryClient {
  public async executer<T extends object = Record<string, unknown>>(): Promise<{
    lignes: T[];
    nombreLignesAffectees: number;
  }> {
    return {
      lignes: [
        { id: 'SECTION-A', code: 'SEC-A', libelle: 'Primaire' },
        { id: 'SECTION-B', code: 'SEC-B', libelle: 'Secondaire' },
      ] as T[],
      nombreLignesAffectees: 2,
    };
  }
}

class SyntheseSectionMemoire {
  public async consulterSyntheseSection(params: { idSectionScolaire: string }) {
    const estPrimaire = params.idSectionScolaire === 'SECTION-A';
    return {
      totalGeneralSection: {
        effectifTotal: estPrimaire ? 18 : 22,
        elevesRedevables: estPrimaire ? 15 : 20,
        elevesEnOrdre: estPrimaire ? 10 : 12,
        elevesNonEnOrdre: estPrimaire ? 5 : 8,
        montantAttendu: new Money(estPrimaire ? 1500 : 2100, 'CDF'),
        montantPaye: new Money(estPrimaire ? 900 : 1400, 'CDF'),
        resteARecouvrer: new Money(estPrimaire ? 600 : 700, 'CDF'),
        tauxRecouvrement: estPrimaire ? 60 : 66.67,
      },
    };
  }
}

test('SyntheseFinanciereEcoleQueryRepository consolide les sections d une ecole', async () => {
  const repository = new SyntheseFinanciereEcoleQueryRepository(
    new SqlQueryClientMemoire(),
    new SyntheseSectionMemoire() as never,
  );

  const lecture = await repository.consulterSyntheseEcole({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
  });

  assert.equal(lecture.lignes.length, 2);
  assert.equal(lecture.totalGeneralEcole.effectifTotal, 40);
  assert.equal(lecture.totalGeneralEcole.elevesRedevables, 35);
  assert.equal(lecture.totalGeneralEcole.resteARecouvrer.obtenirMontant(), 1300);
});
