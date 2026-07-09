import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PostgresUtilisateurAuthRepository,
} from '../../../shared/auth/infrastructure/persistence/postgres/repositories/PostgresUtilisateurAuthRepository';
import { PasswordHashAdapter } from '../../../shared/auth/infrastructure';
import { reinitialiserMemoireAuth } from '../../../shared/auth/tests/support/AuthTestSupport';
import type { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
} from '../../../shared/security/infrastructure';
import { creerRole, reinitialiserMemoireSecurity } from '../../../shared/security/tests/support/SecurityTestSupport';
import { Organisation } from '../domain/aggregates/Organisation';
import type { DepotOrganisation } from '../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../domain/value-objects/OrganisationId';
import { TypeOrganisation } from '../domain/value-objects/TypeOrganisation';
import { CreerOrganisation } from '../application/use-cases/organisations/CreerOrganisation';
import { MettreAJourOrganisation } from '../application/use-cases/organisations/MettreAJourOrganisation';

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

test('MettreAJourOrganisation met a jour la fiche organisation et le responsable principal existant', async () => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();

  const depotOrganisation = new DepotOrganisationMemoire();
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const roleRepository = new PostgresRoleRepository();
  const affectationRepository = new PostgresAffectationUtilisateurRepository();
  await roleRepository.sauvegarder(creerRole({
    codeRole: 'PROMOTEUR_ORGANISATION',
    nomRole: 'Promoteur organisation',
    niveauAcces: 'ORGANISATION',
    permissions: ['referentiel.read'],
    estSysteme: true,
  }));
  const createUseCase = new CreerOrganisation(depotOrganisation, undefined, {
    depotUtilisateurAuth,
    roleRepository,
    affectationRepository,
    passwordHashPort: new PasswordHashAdapter(),
  });

  const creation = await createUseCase.executer({
    code: 'ORG-MAJ',
    nom: 'Organisation avant',
    typeOrganisation: TypeOrganisation.PROMOTEUR,
    creePar: 'manager-systeme',
    description: 'Description initiale',
    promoteurPrincipal: {
      nomComplet: 'Daniel Kalala',
      email: 'daniel.kalala@educsync.test',
      telephone: '+243900000001',
      identifiant: 'dkalala',
      motDePasseInitial: 'Secret123!',
    },
  });

  const useCase = new MettreAJourOrganisation(
    depotOrganisation,
    depotUtilisateurAuth,
  );

  const sortie = await useCase.executer({
    idOrganisation: creation.organisation.id,
    nom: 'Organisation apres',
    typeOrganisation: TypeOrganisation.RESEAU,
    description: 'Description revisee',
    modifiePar: 'manager-systeme',
    promoteurPrincipal: {
      nomComplet: 'Daniel Mukendi',
      email: 'daniel.mukendi@educsync.test',
      telephone: '+243900000099',
      identifiant: 'dmukendi',
    },
  });

  assert.equal(sortie.organisation.nom, 'Organisation apres');
  assert.equal(sortie.organisation.typeOrganisation, TypeOrganisation.RESEAU);
  assert.equal(sortie.organisation.description, 'Description revisee');
  assert.equal(sortie.organisation.promoteurPrincipal?.nomComplet, 'Daniel Mukendi');
  assert.equal(sortie.organisation.promoteurPrincipal?.email, 'daniel.mukendi@educsync.test');
  assert.ok(sortie.organisation.modifieLe);

  const utilisateur = await depotUtilisateurAuth.trouverParId(
    sortie.organisation.promoteurPrincipal?.utilisateurId as string,
  );
  assert.ok(utilisateur);
  assert.equal(utilisateur?.obtenirNomComplet(), 'Daniel Mukendi');
  assert.equal(utilisateur?.obtenirEmail().obtenirValeur(), 'daniel.mukendi@educsync.test');
  assert.equal(utilisateur?.obtenirTelephone(), '+243900000099');
});
