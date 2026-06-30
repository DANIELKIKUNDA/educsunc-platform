import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationSyntheseFinanciereSectionPort } from '../../../application/ports/AutorisationSyntheseFinanciereSectionPort';
import type { SyntheseFinanciereSectionReadModel } from '../../../application/read-models/SyntheseFinanciereSectionReadModel';
import {
  ConsulterSyntheseFinanciereSectionUseCase,
  type SyntheseFinanciereSectionRepository,
} from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereSectionUseCase';

class SyntheseFinanciereSectionMemoire implements SyntheseFinanciereSectionRepository {
  public dernierFiltre?: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idSectionScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  };

  public async consulterSyntheseSection(params: {
    idOrganisation: string;
    idEcole: string;
    idAnneeScolaire: string;
    idSectionScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereSectionReadModel> {
    this.dernierFiltre = params;
    return {
      idOrganisation: params.idOrganisation,
      idEcole: params.idEcole,
      idAnneeScolaire: params.idAnneeScolaire,
      idSectionScolaire: params.idSectionScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes: [],
      totalGeneralSection: {
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

class AutorisationSyntheseSectionMemoire implements AutorisationSyntheseFinanciereSectionPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
  }> = [];

  public async verifierConsultationSyntheseFinanciereSection(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idSectionScolaire: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

test('ConsulterSyntheseFinanciereSection reapplique la doctrine permission + section avant lecture', async () => {
  const repository = new SyntheseFinanciereSectionMemoire();
  const autorisation = new AutorisationSyntheseSectionMemoire();
  const casUsage = new ConsulterSyntheseFinanciereSectionUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idAnneeScolaire: 'ANNEE-001',
    idSectionScolaire: 'SECTION-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });

  assert.equal(sortie.idSectionScolaire, 'SECTION-001');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idSectionScolaire: 'SECTION-001',
  });
  assert.deepEqual(repository.dernierFiltre, {
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idAnneeScolaire: 'ANNEE-001',
    idSectionScolaire: 'SECTION-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });
});
