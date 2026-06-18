import assert from 'node:assert/strict';
import test from 'node:test';
import type { AutorisationCycleVieElevePort } from '../../../application/ports';
import { ChangerStatutEleve } from '../../../application/use-cases/eleves/ChangerStatutEleve';
import type { DepotEleve } from '../../../domain/repositories/DepotEleve';
import { StatutEleve } from '../../../domain/value-objects/StatutEleve';
import { creerEleveFixture, idsScolariteTest } from '../../fixtures/eleves.fixture';
import type { DomainEventBusPort } from '../../../../../shared/application/DomainEventBusPort';

class EventBusMemoire implements DomainEventBusPort {
  public readonly publications: string[][] = [];

  public async publier(evenements: { typeEvenement: string }[]): Promise<void> {
    this.publications.push(evenements.map((evenement) => evenement.typeEvenement));
  }
}

test('ChangerStatutEleve reapplique l autorisation locale avant sauvegarde', async () => {
  const eleve = creerEleveFixture();
  let sauvegardes = 0;
  const appelsAutorisation: Array<{ nouveauStatut: StatutEleve; idUtilisateur: string }> = [];

  const depot: DepotEleve = {
    async sauvegarder() { sauvegardes += 1; },
    async trouverParId() { return eleve; },
    async trouverParMatricule() { return null; },
    async listerParEcole() { return []; },
    async listerParOrganisation() { return []; },
    async rechercherParIdentite() { return []; },
    async existeMatriculeDansEcole() { return false; },
    async existeDoublonProbable() { return false; },
    async trouverParFamille() { return []; },
  };

  const autorisation: AutorisationCycleVieElevePort = {
    async verifierMutationStatutEleve(params) {
      appelsAutorisation.push({
        nouveauStatut: params.nouveauStatut,
        idUtilisateur: params.idUtilisateur,
      });
    },
  };

  const eventBus = new EventBusMemoire();
  const casUsage = new ChangerStatutEleve(depot, undefined, autorisation, undefined, eventBus);

  const sortie = await casUsage.executer({
    idEleve: idsScolariteTest.idEleve,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idempotencyKey: 'idem-1',
    versionAttendue: 1,
    nouveauStatut: StatutEleve.SUSPENDU,
  });

  assert.equal(sortie.eleve.statutGlobal, StatutEleve.SUSPENDU);
  assert.equal(sauvegardes, 1);
  assert.deepEqual(appelsAutorisation, [
    {
      nouveauStatut: StatutEleve.SUSPENDU,
      idUtilisateur: idsScolariteTest.idUtilisateur,
    },
  ]);
  assert.deepEqual(eventBus.publications, [['EleveCree', 'EleveStatutGlobalChange', 'EleveSuspendu']]);
});

test('ChangerStatutEleve ne sauvegarde pas si l autorisation locale refuse', async () => {
  const eleve = creerEleveFixture();
  let sauvegardes = 0;

  const depot: DepotEleve = {
    async sauvegarder() { sauvegardes += 1; },
    async trouverParId() { return eleve; },
    async trouverParMatricule() { return null; },
    async listerParEcole() { return []; },
    async listerParOrganisation() { return []; },
    async rechercherParIdentite() { return []; },
    async existeMatriculeDansEcole() { return false; },
    async existeDoublonProbable() { return false; },
    async trouverParFamille() { return []; },
  };

  const autorisation: AutorisationCycleVieElevePort = {
    async verifierMutationStatutEleve() {
      throw new Error('ACCES_REFUSE');
    },
  };

  const casUsage = new ChangerStatutEleve(depot, undefined, autorisation);

  await assert.rejects(() => casUsage.executer({
    idEleve: idsScolariteTest.idEleve,
    idOrganisation: idsScolariteTest.idOrganisation,
    idEcole: idsScolariteTest.idEcole,
    idUtilisateur: idsScolariteTest.idUtilisateur,
    idempotencyKey: 'idem-1',
    versionAttendue: 1,
    nouveauStatut: StatutEleve.TRANSFERE,
  }), /ACCES_REFUSE/);

  assert.equal(sauvegardes, 0);
});
