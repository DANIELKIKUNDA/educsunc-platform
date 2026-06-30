import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRapportFinancierPort } from '../../../application/ports/AutorisationRapportFinancierPort';
import type { SyntheseFinanciereEcoleReadModel } from '../../../application/read-models/SyntheseFinanciereEcoleReadModel';
import {
  ConsulterSyntheseFinanciereEcoleUseCase,
  type SyntheseFinanciereEcoleRepository,
} from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereEcoleUseCase';

class SyntheseFinanciereEcoleMemoire implements SyntheseFinanciereEcoleRepository {
  public dernierFiltre?: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  };

  public async consulterSyntheseEcole(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereEcoleReadModel> {
    this.dernierFiltre = params;
    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes: [],
      totalGeneralEcole: {
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

class AutorisationRapportFinancierMemoire implements AutorisationRapportFinancierPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];

  public async verifierConsultationRapportJournalier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appels.push(params);
  }

  public async verifierConsultationPaiementsParCaissier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appels.push(params);
  }

  public async verifierConsultationSyntheseFinanciereOrganisation(): Promise<void> {}
}

test('ConsulterSyntheseFinanciereEcole reapplique la doctrine permission + ecole avant lecture', async () => {
  const repository = new SyntheseFinanciereEcoleMemoire();
  const autorisation = new AutorisationRapportFinancierMemoire();
  const casUsage = new ConsulterSyntheseFinanciereEcoleUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idAnneeScolaire: 'ANNEE-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
  assert.deepEqual(repository.dernierFiltre, {
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });
});
