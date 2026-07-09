import assert from 'node:assert/strict';
import test from 'node:test';
import { PasswordHashAdapter } from '../../../shared/auth/infrastructure';
import {
  PostgresUtilisateurAuthRepository,
} from '../../../shared/auth/infrastructure/persistence/postgres/repositories/PostgresUtilisateurAuthRepository';
import { reinitialiserMemoireAuth } from '../../../shared/auth/tests/support/AuthTestSupport';
import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
} from '../../../shared/security/infrastructure';
import {
  creerRole,
  reinitialiserMemoireSecurity,
} from '../../../shared/security/tests/support/SecurityTestSupport';
import type { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { Organisation } from '../domain/aggregates/Organisation';
import type { DepotOrganisation } from '../domain/repositories/DepotOrganisation';
import { OrganisationId } from '../domain/value-objects/OrganisationId';
import { TypeOrganisation } from '../domain/value-objects/TypeOrganisation';
import { CreerOrganisation } from '../application/use-cases/organisations/CreerOrganisation';

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

test('CreerOrganisation provisionne un promoteur principal explicite sans confondre creePar et proprietaire metier', async () => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();

  const depotOrganisation = new DepotOrganisationMemoire();
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const roleRepository = new PostgresRoleRepository();
  const affectationRepository = new PostgresAffectationUtilisateurRepository();
  const rolePromoteur = creerRole({
    codeRole: 'PROMOTEUR_ORGANISATION',
    nomRole: 'Promoteur organisation',
    niveauAcces: 'ORGANISATION',
    permissions: ['audit.read'],
    estSysteme: true,
  });
  await roleRepository.sauvegarder(rolePromoteur);

  const useCase = new CreerOrganisation(depotOrganisation, undefined, {
    depotUtilisateurAuth,
    roleRepository,
    affectationRepository,
    passwordHashPort: new PasswordHashAdapter(),
  });

  const sortie = await useCase.executer({
    code: 'ORG-PREMIUM',
    nom: 'Organisation Premium',
    typeOrganisation: TypeOrganisation.PROMOTEUR,
    creePar: 'user-manager-systeme',
    description: 'Organisation de test premium',
    promoteurPrincipal: {
      nomComplet: 'Jeanne Mukendi',
      email: 'jeanne.mukendi@educsync.test',
      telephone: '+243990001122',
      identifiant: 'jmukendi',
      motDePasseInitial: 'Secret123!',
    },
  });

  assert.equal(sortie.organisation.creePar, 'user-manager-systeme');
  assert.equal(sortie.organisation.promoteurPrincipal?.nomComplet, 'Jeanne Mukendi');
  assert.equal(sortie.organisation.promoteurPrincipal?.email, 'jeanne.mukendi@educsync.test');
  assert.equal(sortie.organisation.promoteurPrincipal?.identifiant, 'jmukendi');

  const utilisateur = await depotUtilisateurAuth.trouverParEmail('jeanne.mukendi@educsync.test');
  assert.ok(utilisateur);
  assert.equal(utilisateur?.obtenirNomComplet(), 'Jeanne Mukendi');

  const affectations = await affectationRepository.listerActivesParUtilisateur(utilisateur!.obtenirId());
  assert.equal(affectations.length, 1);
  assert.equal(affectations[0].obtenirIdOrganisation(), sortie.organisation.id);
  assert.equal(affectations[0].obtenirScopes().some((scope) =>
    scope.obtenirTypeScope().obtenirValeur() === 'ORGANISATION'
    && scope.obtenirValeurScope() === sortie.organisation.id), true);
});

test('CreerOrganisation continue de fonctionner sans promoteur principal explicite', async () => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();

  const depotOrganisation = new DepotOrganisationMemoire();
  const useCase = new CreerOrganisation(depotOrganisation);

  const sortie = await useCase.executer({
    code: 'ORG-SIMPLE',
    nom: 'Organisation simple',
    typeOrganisation: TypeOrganisation.AUTRE,
    creePar: 'user-manager-systeme',
  });

  assert.equal(sortie.organisation.promoteurPrincipal, undefined);
  assert.equal(sortie.organisation.creePar, 'user-manager-systeme');
});

test('CreerOrganisation initialise automatiquement le role promoteur s il est absent', async () => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();

  const depotOrganisation = new DepotOrganisationMemoire();
  const depotUtilisateurAuth = new PostgresUtilisateurAuthRepository();
  const roleRepository = new PostgresRoleRepository();
  const affectationRepository = new PostgresAffectationUtilisateurRepository();

  const useCase = new CreerOrganisation(depotOrganisation, undefined, {
    depotUtilisateurAuth,
    roleRepository,
    affectationRepository,
    passwordHashPort: new PasswordHashAdapter(),
  });

  const sortie = await useCase.executer({
    code: 'ORG-AUTO-ROLE',
    nom: 'Organisation Auto Role',
    typeOrganisation: TypeOrganisation.PROMOTEUR,
    creePar: 'user-manager-systeme',
    promoteurPrincipal: {
      nomComplet: 'Paul Kalonji',
      email: 'paul.kalonji@educsync.test',
      motDePasseInitial: 'Secret123!',
    },
  });

  const rolePromoteur = await roleRepository.trouverParCode('PROMOTEUR_ORGANISATION');
  assert.ok(rolePromoteur);
  assert.equal(rolePromoteur?.obtenirCodeRole().obtenirValeur(), 'PROMOTEUR_ORGANISATION');
  assert.equal(sortie.organisation.promoteurPrincipal?.nomComplet, 'Paul Kalonji');
});
