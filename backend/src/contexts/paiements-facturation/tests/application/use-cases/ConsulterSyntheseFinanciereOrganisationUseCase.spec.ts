import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRapportFinancierPort } from '../../../application/ports/AutorisationRapportFinancierPort';
import type { SyntheseFinanciereOrganisationReadModel } from '../../../application/read-models/SyntheseFinanciereOrganisationReadModel';
import {
  ConsulterSyntheseFinanciereOrganisationUseCase,
  type SyntheseFinanciereOrganisationRepository,
} from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereOrganisationUseCase';

class SyntheseFinanciereOrganisationMemoire implements SyntheseFinanciereOrganisationRepository {
  public dernierFiltre?: {
    idOrganisation: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  };

  public async consulterSyntheseOrganisation(params: {
    idOrganisation: string;
    idAnneeScolaire: string;
    moisAnalyseJusqua?: string;
    typeFrais?: string;
  }): Promise<SyntheseFinanciereOrganisationReadModel> {
    this.dernierFiltre = params;
    return {
      idOrganisation: params.idOrganisation,
      idAnneeScolaire: params.idAnneeScolaire,
      moisAnalyseJusqua: params.moisAnalyseJusqua,
      typeFrais: params.typeFrais,
      lignes: [],
      totalGeneralOrganisation: {
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

class AutorisationOrganisationMemoire implements AutorisationRapportFinancierPort {
  public appelsOrganisation: Array<{
    idUtilisateur: string;
    idOrganisation: string;
  }> = [];

  public async verifierConsultationRapportJournalier(): Promise<void> {}

  public async verifierConsultationPaiementsParCaissier(): Promise<void> {}

  public async verifierConsultationSyntheseFinanciereOrganisation(params: {
    idUtilisateur: string;
    idOrganisation: string;
  }): Promise<void> {
    this.appelsOrganisation.push(params);
  }
}

test('ConsulterSyntheseFinanciereOrganisation reapplique la doctrine permission + organisation avant lecture', async () => {
  const repository = new SyntheseFinanciereOrganisationMemoire();
  const autorisation = new AutorisationOrganisationMemoire();
  const casUsage = new ConsulterSyntheseFinanciereOrganisationUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idUtilisateur: 'UTIL-001',
    idAnneeScolaire: 'ANNEE-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });

  assert.equal(sortie.idOrganisation, 'ORG-001');
  assert.deepEqual(autorisation.appelsOrganisation[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
  });
  assert.deepEqual(repository.dernierFiltre, {
    idOrganisation: 'ORG-001',
    idAnneeScolaire: 'ANNEE-001',
    moisAnalyseJusqua: 'JANVIER',
    typeFrais: 'FRAIS_MINERVAL',
  });
});
