import test from 'node:test';
import assert from 'node:assert/strict';
import type { AutorisationSituationFinanciereElevePort } from '../../../application/ports/AutorisationSituationFinanciereElevePort';
import type {
  ClasseEleveDTO,
  ElevePaiementDTO,
  FamillePaiementDTO,
  InscriptionPaiementDTO,
  ScolariteElevesPort,
  StatutScolaireDTO,
} from '../../../application/ports/ScolariteElevesPort';
import type { ArrieresEleveReadModel } from '../../../application/read-models/ArrieresEleveReadModel';
import {
  ConsulterArrieresEleveUseCase,
  type ArrieresEleveRepository,
} from '../../../application/use-cases/dettes/ConsulterArrieresEleveUseCase';
import { Money } from '../../../domain/value-objects/Money';

class ArrieresRepositoryMemoire implements ArrieresEleveRepository {
  public dernierIdEcole?: string;

  public async consulterParEleve(
    idEcole: string,
    idEleve: string,
  ): Promise<ArrieresEleveReadModel> {
    this.dernierIdEcole = idEcole;

    return {
      idEleve,
      totalArrieres: new Money(3_000, 'CDF'),
    };
  }
}

class AutorisationSituationFinanciereMemoire implements AutorisationSituationFinanciereElevePort {
  public appels: Array<{
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }> = [];

  public async verifierConsultationSituationFinanciereEleve(params: {
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

test("ConsulterArrieresEleve reapplique l'autorisation locale et filtre par ecole", async () => {
  const repository = new ArrieresRepositoryMemoire();
  const autorisation = new AutorisationSituationFinanciereMemoire();
  const casUsage = new ConsulterArrieresEleveUseCase(
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

  assert.equal(sortie.totalArrieres.obtenirMontant(), 3_000);
  assert.equal(repository.dernierIdEcole, 'ECOLE-001');
  assert.deepEqual(autorisation.appels[0], {
    idUtilisateur: 'UTIL-001',
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idEleve: 'ELEVE-001',
  });
});

test("ConsulterArrieresEleve refuse un eleve hors perimetre organisation + ecole", async () => {
  class ScolariteHorsPerimetreMemoire extends ScolaritePortMemoire {
    public override async consulterEleve(idEleve: string): Promise<ElevePaiementDTO> {
      return { idEleve, idEcole: 'ECOLE-999', idOrganisation: 'ORG-999' };
    }
  }

  const casUsage = new ConsulterArrieresEleveUseCase(
    new ArrieresRepositoryMemoire(),
    new ScolariteHorsPerimetreMemoire(),
    new AutorisationSituationFinanciereMemoire(),
  );

  await assert.rejects(() => casUsage.executer({
    idOrganisation: 'ORG-001',
    idEcole: 'ECOLE-001',
    idUtilisateur: 'UTIL-001',
    idEleve: 'ELEVE-001',
  }));
});
