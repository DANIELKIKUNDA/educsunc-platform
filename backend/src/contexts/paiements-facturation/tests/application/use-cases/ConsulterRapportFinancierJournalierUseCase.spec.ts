import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationRapportFinancierPort } from '../../../application/ports/AutorisationRapportFinancierPort';
import type { RapportFinancierReadModel } from '../../../application/read-models/RapportFinancierReadModel';
import { ConsulterRapportFinancierJournalierUseCase } from '../../../application/use-cases/rapports/ConsulterRapportFinancierJournalierUseCase';
import { Money } from '../../../domain/value-objects/Money';

class RapportJournalierMemoire {
  public dernierIdEcole?: string;
  public derniereDate?: string;

  public async consulterRapportJournalier(
    idEcole: string,
    date: string,
  ): Promise<RapportFinancierReadModel> {
    this.dernierIdEcole = idEcole;
    this.derniereDate = date;

    return {
      periode: date,
      totalEncaisse: new Money(10_000, 'CDF'),
      totalConsomme: new Money(9_000, 'CDF'),
      totalAnticipe: new Money(0, 'CDF'),
      totalRestitue: new Money(500, 'CDF'),
      totalAnnule: new Money(500, 'CDF'),
    };
  }
}

class AutorisationRapportMemoire implements AutorisationRapportFinancierPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];
  public appelsParCaissier: Array<{
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
    this.appelsParCaissier.push(params);
  }
}

test('ConsulterRapportFinancierJournalier reapplique l autorisation locale et filtre par ecole', async () => {
  const repository = new RapportJournalierMemoire();
  const autorisation = new AutorisationRapportMemoire();
  const casUsage = new ConsulterRapportFinancierJournalierUseCase(
    repository,
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    date: '2026-09-01',
  });

  assert.equal(sortie.periode, '2026-09-01');
  assert.equal(repository.dernierIdEcole, 'ECOLE-001');
  assert.equal(repository.derniereDate, '2026-09-01');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
});
