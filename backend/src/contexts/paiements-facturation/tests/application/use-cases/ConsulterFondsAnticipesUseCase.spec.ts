import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  AutorisationFondsAnticipesPort,
  ResultatAutorisationFondsAnticipes,
} from '../../../application/ports/AutorisationFondsAnticipesPort';
import type { FondsAnticipesReadModel } from '../../../application/read-models/FondsAnticipesReadModel';
import { ConsulterFondsAnticipesUseCase } from '../../../application/use-cases/rapports/ConsulterFondsAnticipesUseCase';
import { Money } from '../../../domain/value-objects/Money';

class FondsAnticipesMemoire {
  public dernierIdEcole?: string;
  public dernierFiltreEleves?: readonly string[];

  public async consulter(
    idEcole: string,
    _dateDebut?: string,
    _dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<FondsAnticipesReadModel> {
    this.dernierIdEcole = idEcole;
    this.dernierFiltreEleves = idsElevesAutorises;

    return {
      idEcole,
      totalFondsAnticipes: new Money(12_000, 'CDF'),
      lignes: [{
        origineAffectation: 'ANTICIPE',
        total: new Money(12_000, 'CDF'),
      }],
    };
  }
}

class AutorisationFondsAnticipesMemoire implements AutorisationFondsAnticipesPort {
  public async resoudreConsultationFondsAnticipes(): Promise<ResultatAutorisationFondsAnticipes> {
    return { idsElevesAutorises: ['ELEVE-1', 'ELEVE-2'] };
  }
}

test('ConsulterFondsAnticipes applique le filtre eleves resolu par la securite locale', async () => {
  const repository = new FondsAnticipesMemoire();
  const casUsage = new ConsulterFondsAnticipesUseCase(
    repository,
    new AutorisationFondsAnticipesMemoire(),
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.deepEqual(repository.dernierFiltreEleves, ['ELEVE-1', 'ELEVE-2']);
});
