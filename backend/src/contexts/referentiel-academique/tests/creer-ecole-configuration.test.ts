import assert from 'node:assert/strict';
import test from 'node:test';

import type { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { Ecole } from '../domain/aggregates/Ecole';
import { Organisation } from '../domain/aggregates/Organisation';
import type { DepotEcole } from '../domain/repositories/DepotEcole';
import type { DepotOrganisation } from '../domain/repositories/DepotOrganisation';
import { EcoleId } from '../domain/value-objects/EcoleId';
import { ModeExploitation } from '../domain/value-objects/ModeExploitation';
import { OrganisationId } from '../domain/value-objects/OrganisationId';
import { TypeOrganisation } from '../domain/value-objects/TypeOrganisation';
import { CreerEcole } from '../application/use-cases/ecoles/CreerEcole';

class DepotOrganisationMemoire implements DepotOrganisation {
  public readonly organisations = new Map<string, Organisation>();

  public async trouverParId(idOrganisation: OrganisationId): Promise<Organisation | null> {
    return this.organisations.get(idOrganisation.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<Organisation | null> {
    return [...this.organisations.values()].find((organisation) => organisation.obtenirCode() === code) ?? null;
  }

  public async trouverParNom(nom: string): Promise<Organisation | null> {
    return [...this.organisations.values()].find((organisation) => organisation.obtenirNom() === nom) ?? null;
  }

  public async lister(pagination: Pagination): Promise<ResultatPagine<Organisation>> {
    const donnees = [...this.organisations.values()];
    return {
      donnees,
      total: donnees.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(organisation: Organisation): Promise<void> {
    this.organisations.set(organisation.obtenirId().obtenirValeur(), organisation);
  }
}

class DepotEcoleMemoire implements DepotEcole {
  public readonly ecoles = new Map<string, Ecole>();

  public async trouverParId(idEcole: EcoleId): Promise<Ecole | null> {
    return this.ecoles.get(idEcole.obtenirValeur()) ?? null;
  }

  public async trouverParCode(code: string): Promise<Ecole | null> {
    return [...this.ecoles.values()].find((ecole) => ecole.obtenirCode() === code) ?? null;
  }

  public async listerParOrganisation(
    idOrganisation: OrganisationId,
    pagination: Pagination,
  ): Promise<ResultatPagine<Ecole>> {
    const donnees = [...this.ecoles.values()].filter(
      (ecole) => ecole.obtenirOrganisationId().obtenirValeur() === idOrganisation.obtenirValeur(),
    );
    return {
      donnees,
      total: donnees.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async lister(pagination: Pagination): Promise<ResultatPagine<Ecole>> {
    const donnees = [...this.ecoles.values()];
    return {
      donnees,
      total: donnees.length,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(ecole: Ecole): Promise<void> {
    this.ecoles.set(ecole.obtenirId().obtenirValeur(), ecole);
  }
}

test("CreerEcole declenche l'initialisation officielle de configuration locale", async () => {
  const depotOrganisation = new DepotOrganisationMemoire();
  const depotEcole = new DepotEcoleMemoire();
  const organisation = new Organisation(
    new OrganisationId('org-ecole-test'),
    'ORG-ECOLE',
    'Organisation de test',
    TypeOrganisation.PROMOTEUR,
    undefined,
    'manager-systeme',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    true,
    new Date('2026-01-01T00:00:00.000Z'),
  );
  await depotOrganisation.sauvegarder(organisation);

  const initialisations: Array<{ organisationId: string; ecoleId: string }> = [];
  const useCase = new CreerEcole(
    depotEcole,
    depotOrganisation,
    undefined,
    {
      amorcerEcole: async ({ organisationId, ecoleId }) => {
        initialisations.push({ organisationId, ecoleId });
      },
    },
  );

  const sortie = await useCase.executer({
    idOrganisation: organisation.obtenirId().obtenirValeur(),
    code: 'ECOLE-001',
    nom: 'College test',
    modeExploitation: ModeExploitation.SYNC,
    creePar: 'manager-systeme',
  });

  assert.deepEqual(initialisations, [
    {
      organisationId: organisation.obtenirId().obtenirValeur(),
      ecoleId: sortie.ecole.id,
    },
  ]);
});
