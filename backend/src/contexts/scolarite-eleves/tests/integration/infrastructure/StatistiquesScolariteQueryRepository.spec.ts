import test from 'node:test';
import assert from 'node:assert/strict';
import { StatistiquesScolariteQueryRepository } from '../../../infrastructure/persistence/queries/StatistiquesScolariteQueryRepository';
import type {
  ClientPostgresScolariteEleves,
  ResultatExecutionPostgresScolarite,
} from '../../../infrastructure/persistence/postgres/depots/ClientPostgresScolariteEleves';

class ClientPostgresStatistiquesMemoire implements ClientPostgresScolariteEleves {
  public requetesExecutees: string[] = [];
  public parametresRecus: unknown[][] = [];

  constructor(private readonly lignes: readonly Record<string, unknown>[]) {}

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionPostgresScolarite<TLigne>> {
    this.requetesExecutees.push(requeteSql);
    this.parametresRecus.push([...parametres]);

    return {
      lignes: this.lignes as readonly TLigne[],
      nombreLignesAffectees: this.lignes.length,
    };
  }
}

test('StatistiquesScolariteQueryRepository calcule les statistiques organisation avec une seule query', async () => {
  const client = new ClientPostgresStatistiquesMemoire([
    {
      id_ecole: 'ecole-1',
      classe: '1A',
      sexe: 'M',
      total_eleves: '10',
      total_inscriptions: '10',
      total_participants: '10',
      total_abandons: '1',
    },
    {
      id_ecole: 'ecole-1',
      classe: '1A',
      sexe: 'F',
      total_eleves: '8',
      total_inscriptions: '8',
      total_participants: '8',
      total_abandons: '2',
    },
    {
      id_ecole: 'ecole-2',
      classe: '2A',
      sexe: 'M',
      total_eleves: '7',
      total_inscriptions: '7',
      total_participants: '7',
      total_abandons: '0',
    },
  ]);
  const repository = new StatistiquesScolariteQueryRepository(client);

  const statistiques = await repository.obtenirStatistiques({ idOrganisation: 'org-1' });

  assert.equal(client.requetesExecutees.length, 1);
  assert.equal(client.parametresRecus[0][0], 'org-1');
  assert.equal(client.parametresRecus[0][1], null);
  assert.match(client.requetesExecutees[0], /annee\.active = TRUE/);
  assert.match(client.requetesExecutees[0], /i\.statut_inscription = 'VALIDEE'/);
  assert.match(client.requetesExecutees[0], /e\.supprime_logiquement = FALSE/);
  assert.match(client.requetesExecutees[0], /a\.active = TRUE/);
  assert.equal(statistiques.scope, 'ORGANISATION');
  assert.equal(statistiques.effectifs.total, 25);
  assert.equal(statistiques.effectifs.garcons, 17);
  assert.equal(statistiques.effectifs.filles, 8);
  assert.equal(statistiques.abandons.total, 3);
  assert.equal(statistiques.abandons.tauxAbandon, 3 / 25);
  assert.equal(statistiques.participation.inscrits, 25);
  assert.equal(statistiques.participation.participants, 25);
  assert.equal(statistiques.participation.tauxParticipation, 1);
  assert.deepEqual(statistiques.progression, { promus: 0, redoublants: 0 });
  assert.deepEqual(statistiques.parEcole, [
    { idEcole: 'ecole-1', totalEleves: 18, totalAbandons: 3 },
    { idEcole: 'ecole-2', totalEleves: 7, totalAbandons: 0 },
  ]);
});

test('StatistiquesScolariteQueryRepository calcule le scope ecole et retourne zero sans donnees', async () => {
  const client = new ClientPostgresStatistiquesMemoire([]);
  const repository = new StatistiquesScolariteQueryRepository(client);

  const statistiques = await repository.obtenirStatistiques({
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  });

  assert.equal(client.requetesExecutees.length, 1);
  assert.equal(client.parametresRecus[0][1], 'ecole-1');
  assert.equal(statistiques.scope, 'ECOLE');
  assert.deepEqual(statistiques.ecole, { idEcole: 'ecole-1' });
  assert.equal(statistiques.effectifs.total, 0);
  assert.equal(statistiques.abandons.tauxAbandon, 0);
  assert.equal(statistiques.participation.tauxParticipation, 0);
  assert.equal(statistiques.parEcole, undefined);
});
