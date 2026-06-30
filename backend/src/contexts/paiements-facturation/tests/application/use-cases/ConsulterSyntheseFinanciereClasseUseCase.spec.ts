import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRegistreFinancierClassePort } from '../../../application/ports/AutorisationRegistreFinancierClassePort';
import type { SyntheseFinanciereClasseReadModel } from '../../../application/read-models/SyntheseFinanciereClasseReadModel';
import {
  ConsulterSyntheseFinanciereClasseUseCase,
  type SyntheseFinanciereClasseRepository,
} from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereClasseUseCase';

class SyntheseFinanciereClasseMemoire implements SyntheseFinanciereClasseRepository {
  public dernierFiltre?: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  };

  public async consulterSyntheseClasse(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassePedagogique: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereClasseReadModel> {
    this.dernierFiltre = params;
    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idClassePedagogique: params.idClassePedagogique,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes: [],
      situationActuelle: {
        effectifTotal: 0,
        elevesRedevables: 0,
        elevesEnOrdre: 0,
        elevesNonEnOrdre: 0,
        montantAttendu: { obtenirMontant: () => 0 } as never,
        montantPaye: { obtenirMontant: () => 0 } as never,
        resteARecouvrer: { obtenirMontant: () => 0 } as never,
        tauxRecouvrement: 0,
      },
    };
  }
}

class AutorisationSyntheseFinanciereClasseMemoire implements AutorisationRegistreFinancierClassePort {
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

test('ConsulterSyntheseFinanciereClasse reapplique la doctrine permission + classe + annee avant lecture', async () => {
  const repository = new SyntheseFinanciereClasseMemoire();
  const autorisation = new AutorisationSyntheseFinanciereClasseMemoire();
  const casUsage = new ConsulterSyntheseFinanciereClasseUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idAnneeScolaire: 'ANNEE-001',
    idClassePedagogique: 'CLASSE-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });

  assert.equal(sortie.idClassePedagogique, 'CLASSE-001');
  assert.equal(sortie.typeFrais, 'FRAIS_MINERVAL');
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
    typeFrais: 'FRAIS_MINERVAL',
  });
});
