import test from 'node:test';
import assert from 'node:assert/strict';
import { ContexteTenant } from '../../../shared/tenancy/TenantContext';
import { AnneeScolaireId } from '../domain/value-objects/AnneeScolaireId';
import { DepotAnneeScolairePostgres } from '../infrastructure/persistence/postgres/depots/DepotAnneeScolairePostgres';
import type {
  ClientPostgresReferentielAcademique,
  ResultatExecutionPostgres,
} from '../infrastructure/persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { ContexteExecutionTenantReferentielAcademique } from '../infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';

interface RequeteCapturee {
  requeteSql: string;
  parametres: readonly unknown[];
}

class FauxClientPostgresReferentielAcademique
  implements ClientPostgresReferentielAcademique
{
  public readonly requetes: RequeteCapturee[] = [];

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionPostgres<TLigne>> {
    this.requetes.push({ requeteSql, parametres });

    return {
      lignes: [],
      nombreLignesAffectees: 0,
    };
  }
}

test('le depot des annees scolaires filtre la lecture par tenant local', async () => {
  const clientPostgres = new FauxClientPostgresReferentielAcademique();
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const depot = new DepotAnneeScolairePostgres(
    clientPostgres,
    undefined,
    contexteExecutionTenant,
  );
  const contexteTenant = new ContexteTenant();
  const idEcole = '00000000-0000-0000-0000-000000000111';

  contexteTenant.definirTenant(idEcole);

  await contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
    await depot.trouverParId(new AnneeScolaireId('00000000-0000-0000-0000-000000000222'));
  });

  assert.equal(clientPostgres.requetes.length, 1);
  assert.match(clientPostgres.requetes[0].requeteSql, /"id_ecole" = \$2/);
  assert.equal(clientPostgres.requetes[0].parametres[1], idEcole);
});

test('le depot des annees scolaires autorise une lecture organisationnelle isolee', async () => {
  const clientPostgres = new FauxClientPostgresReferentielAcademique();
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const depot = new DepotAnneeScolairePostgres(
    clientPostgres,
    undefined,
    contexteExecutionTenant,
  );
  const contexteTenant = new ContexteTenant();
  const idOrganisation = '00000000-0000-0000-0000-000000000333';

  contexteTenant.definirOrganisation(idOrganisation);
  contexteTenant.activerLectureOrganisationnelle();

  await contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
    await depot.trouverParId(new AnneeScolaireId('00000000-0000-0000-0000-000000000444'));
  });

  assert.equal(clientPostgres.requetes.length, 1);
  assert.match(clientPostgres.requetes[0].requeteSql, /EXISTS/);
  assert.equal(clientPostgres.requetes[0].parametres[1], idOrganisation);
});
