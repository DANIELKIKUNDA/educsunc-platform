import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationHistoriquePaiementsPort } from '../../../application/ports/AutorisationHistoriquePaiementsPort';
import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../../application/ports/ScolariteElevesPort';
import type { HistoriquePaiementsEleveReadModel } from '../../../application/read-models/HistoriquePaiementsEleveReadModel';
import {
  ConsulterHistoriquePaiementsEleveUseCase,
  type HistoriquePaiementsEleveRepository,
} from '../../../application/use-cases/dettes/ConsulterHistoriquePaiementsEleveUseCase';
import { Money } from '../../../domain/value-objects/Money';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { StatutPaiement } from '../../../domain/value-objects/StatutPaiement';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';

class HistoriqueRepositoryMemoire implements HistoriquePaiementsEleveRepository {
  public dernierIdEcole?: string;

  public async consulterParEleve(
    idEcole: string,
    idEleve: string,
  ): Promise<HistoriquePaiementsEleveReadModel> {
    this.dernierIdEcole = idEcole;

    return {
      idEleve,
      paiements: [{
        idPaiement: 'PAY-001',
        creeLe: new Date('2026-09-01T08:00:00.000Z'),
        montantTotal: new Money(10_000, 'CDF'),
        modePaiement: ModePaiement.CASH,
        typeFraisDeclare: TypeFrais.FRAIS_SCOLAIRES,
        statutPaiement: StatutPaiement.VALIDE,
      }],
    };
  }
}

class AutorisationHistoriqueMemoire implements AutorisationHistoriquePaiementsPort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }> = [];

  public async verifierConsultationHistoriquePaiements(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    this.appels.push(params);
  }
}

class ScolaritePortMemoire implements ScolariteElevesPort {
  public async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
    return { idEleve, idEcole: 'ECOLE-001', idOrganisation: 'ORG-001' };
  }

  public async consulterInscriptionActive(idEleve: string): Promise<InscriptionPaiementDTO | null> {
    return {
      idInscriptionScolaire: 'INSC-001',
      idEleve,
      idEcole: 'ECOLE-001',
      idAnneeScolaire: 'ANNEE-001',
    };
  }

  public async consulterClasseActiveEleve(): Promise<ClasseEleveDTO | null> { return null; }
  public async consulterFamilleEleve(): Promise<FamillePaiementDTO | null> { return null; }
  public async verifierStatutScolaire(idEleve: string): Promise<StatutScolaireDTO> {
    return { idEleve, statut: 'ACTIF', actif: true };
  }
}

test("ConsulterHistoriquePaiementsEleve reapplique l'autorisation locale et filtre par ecole", async () => {
  const repository = new HistoriqueRepositoryMemoire();
  const autorisation = new AutorisationHistoriqueMemoire();
  const casUsage = new ConsulterHistoriquePaiementsEleveUseCase(
    repository,
    new ScolaritePortMemoire(),
    autorisation,
  );

  const sortie = await casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  });

  assert.equal(sortie.paiements.length, 1);
  assert.equal(repository.dernierIdEcole, 'ECOLE-001');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
  });
});

test("ConsulterHistoriquePaiementsEleve refuse un eleve hors perimetre organisation + ecole", async () => {
  class ScolariteHorsPerimetreMemoire extends ScolaritePortMemoire {
    public override async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
      return { idEleve, idEcole: 'ECOLE-999', idOrganisation: 'ORG-999' };
    }
  }

  const casUsage = new ConsulterHistoriquePaiementsEleveUseCase(
    new HistoriqueRepositoryMemoire(),
    new ScolariteHorsPerimetreMemoire(),
    new AutorisationHistoriqueMemoire(),
  );

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  }));
});
