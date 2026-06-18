import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationConsultationRecusPort } from '../../../application/ports/AutorisationConsultationRecusPort';
import type { RecusPaiementReadModel } from '../../../application/read-models/RecusPaiementReadModel';
import {
  ConsulterRecusPaiementUseCase,
  type RecusPaiementQueryRepository,
} from '../../../application/use-cases/recus/ConsulterRecusPaiementUseCase';
import { Money } from '../../../domain/value-objects/Money';

class RecusRepositoryMemoire implements RecusPaiementQueryRepository {
  public dernierFiltre?: {
    idEcole: string;
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  };

  public async listerRecus(params: {
    idEcole: string;
    idEleve?: string;
    numeroRecu?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Promise<RecusPaiementReadModel> {
    this.dernierFiltre = params;

    return {
      idEcole: params.idEcole,
      filtres: {
        idEleve: params.idEleve,
        numeroRecu: params.numeroRecu,
        dateDebut: params.dateDebut,
        dateFin: params.dateFin,
      },
      recus: [{
        idRecu: 'RECU-001',
        numeroRecu: '00025606',
        idPaiement: 'PAY-001',
        idEleve: params.idEleve ?? 'ELEVE-001',
        idCaissier: 'UTIL-CAISSE-001',
        dateEmission: new Date('2026-06-11T08:30:00.000Z'),
        modePaiement: 'CASH',
        totalPaye: new Money(120_000, 'CDF'),
        statutRecu: 'EMIS',
      }],
    };
  }
}

class AutorisationConsultationRecusMemoire implements AutorisationConsultationRecusPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }> = [];

  public async verifierConsultationRecus(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

test('ConsulterRecusPaiement reapplique la securite locale et transmet les filtres de recherche', async () => {
  const repository = new RecusRepositoryMemoire();
  const autorisation = new AutorisationConsultationRecusMemoire();
  const casUsage = new ConsulterRecusPaiementUseCase(repository, autorisation);

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-009',
    numeroRecu: '00025606',
    dateDebut: '2026-06-01',
    dateFin: '2026-06-30',
  });

  assert.equal(sortie.recus.length, 1);
  assert.deepEqual(repository.dernierFiltre, {
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-009',
    numeroRecu: '00025606',
    dateDebut: '2026-06-01',
    dateFin: '2026-06-30',
  });
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
  });
});
