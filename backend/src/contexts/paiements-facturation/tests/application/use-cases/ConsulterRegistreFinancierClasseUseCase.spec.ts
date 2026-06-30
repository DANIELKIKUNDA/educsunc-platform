import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRegistreFinancierClassePort } from '../../../application/ports/AutorisationRegistreFinancierClassePort';
import type { RegistreFinancierClasseReadModel } from '../../../application/read-models/RegistreFinancierClasseReadModel';
import {
  ConsulterRegistreFinancierClasseUseCase,
  type RegistreFinancierClasseRepository,
} from '../../../application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase';

class RegistreFinancierClasseMemoire implements RegistreFinancierClasseRepository {
  public dernierFiltre?: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
  };

  public async consulterRegistreClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
  }): Promise<RegistreFinancierClasseReadModel> {
    this.dernierFiltre = params;
    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      colonnes: [],
      lignes: [],
      statistiquesParColonne: [],
    };
  }
}

class AutorisationRegistreFinancierClasseMemoire implements AutorisationRegistreFinancierClassePort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }> = [];

  public async verifierConsultationRegistreFinancierClasse(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

test('ConsulterRegistreFinancierClasse reapplique la doctrine permission + classe + annee avant lecture', async () => {
  const repository = new RegistreFinancierClasseMemoire();
  const autorisation = new AutorisationRegistreFinancierClasseMemoire();
  const casUsage = new ConsulterRegistreFinancierClasseUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idAnneeScolaire: 'ANNEE-001',
    idClassePedagogique: 'CLASSE-001',
    moisAnalyseJusqua: 'JANVIER',
  });

  assert.equal(sortie.idClassePedagogique, 'CLASSE-001');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idClassePedagogique: 'CLASSE-001',
    idAnneeScolaire: 'ANNEE-001',
  });
  assert.deepEqual(repository.dernierFiltre, {
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
    idClassePedagogique: 'CLASSE-001',
    moisAnalyseJusqua: 'JANVIER',
  });
});
