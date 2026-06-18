import test from 'node:test';
import assert from 'node:assert/strict';
import type {
  AutorisationPaiementsParTypeFraisPort,
  ResultatAutorisationPaiementsParTypeFrais,
} from '../../../application/ports/AutorisationPaiementsParTypeFraisPort';
import type { PaiementsParTypeFraisReadModel } from '../../../application/read-models/PaiementsParTypeFraisReadModel';
import { ConsulterPaiementsParTypeFraisUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParTypeFraisUseCase';
import { Money } from '../../../domain/value-objects/Money';

class PaiementsParTypeFraisMemoire {
  public dernierIdEcole?: string;
  public dernierFiltreEleves?: readonly string[];

  public async listerParType(
    idEcole: string,
    _dateDebut?: string,
    _dateFin?: string,
    idsElevesAutorises?: readonly string[],
  ): Promise<PaiementsParTypeFraisReadModel> {
    this.dernierIdEcole = idEcole;
    this.dernierFiltreEleves = idsElevesAutorises;

    return {
      idEcole,
      lignes: [{
        typeFrais: 'FRAIS_SCOLAIRES',
        total: new Money(9_000, 'CDF'),
      }],
    };
  }
}

class AutorisationPaiementsParTypeMemoire implements AutorisationPaiementsParTypeFraisPort {
  public async resoudreConsultationPaiementsParTypeFrais(): Promise<ResultatAutorisationPaiementsParTypeFrais> {
    return { idsElevesAutorises: ['ELEVE-1', 'ELEVE-2'] };
  }
}

test('ConsulterPaiementsParTypeFrais applique le filtre eleves resolu par la securite locale', async () => {
  const repository = new PaiementsParTypeFraisMemoire();
  const casUsage = new ConsulterPaiementsParTypeFraisUseCase(
    repository,
    new AutorisationPaiementsParTypeMemoire(),
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.deepEqual(repository.dernierFiltreEleves, ['ELEVE-1', 'ELEVE-2']);
});
