import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRapportFinancierPort } from '../../../application/ports/AutorisationRapportFinancierPort';
import type { PaiementsParCaissierReadModel } from '../../../application/read-models/PaiementsParCaissierReadModel';
import { ConsulterPaiementsParCaissierUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParCaissierUseCase';
import { Money } from '../../../domain/value-objects/Money';

class PaiementsParCaissierMemoire {
  public dernierIdEcole?: string;
  public derniereDateDebut?: string;
  public derniereDateFin?: string;

  public async listerParCaissier(
    idEcole: string,
    dateDebut?: string,
    dateFin?: string,
  ): Promise<PaiementsParCaissierReadModel> {
    this.dernierIdEcole = idEcole;
    this.derniereDateDebut = dateDebut;
    this.derniereDateFin = dateFin;

    return {
      idEcole,
      dateDebut,
      dateFin,
      lignes: [
        {
          idCaissier: 'UTIL-CAISSIER-1',
          total: new Money(12_000, 'CDF'),
        },
      ],
    };
  }
}

class AutorisationRapportMemoire implements AutorisationRapportFinancierPort {
  public appelsJournalier: Array<{ idUtilisateur: string; idOrganisation: string; idEcole: string }> = [];
  public appelsParCaissier: Array<{ idUtilisateur: string; idOrganisation: string; idEcole: string }> = [];

  public async verifierConsultationRapportJournalier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appelsJournalier.push(params);
  }

  public async verifierConsultationPaiementsParCaissier(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appelsParCaissier.push(params);
  }

  public async verifierConsultationSyntheseFinanciereOrganisation(): Promise<void> {}
}

test('ConsulterPaiementsParCaissier reapplique l autorisation locale et filtre par ecole', async () => {
  const repository = new PaiementsParCaissierMemoire();
  const autorisation = new AutorisationRapportMemoire();
  const casUsage = new ConsulterPaiementsParCaissierUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    dateDebut: '2026-09-01',
    dateFin: '2026-09-30',
  });

  assert.equal(sortie.idEcole, 'ECOLE-001');
  assert.equal(sortie.lignes.length, 1);
  assert.equal(repository.dernierIdEcole, 'ECOLE-001');
  assert.equal(repository.derniereDateDebut, '2026-09-01');
  assert.equal(repository.derniereDateFin, '2026-09-30');
  assert.deepEqual(autorisation.appelsParCaissier[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
});
