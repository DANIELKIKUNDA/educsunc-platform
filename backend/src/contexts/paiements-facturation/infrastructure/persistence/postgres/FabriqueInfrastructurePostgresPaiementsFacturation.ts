import { type Pool } from 'pg';
import { PaiementTenantContext } from '../../tenancy/PaiementTenantContext';
import {
  ClientPoolPostgresPaiementsFacturation,
  type ConfigurationPoolPostgresPaiementsFacturation,
  creerConfigurationPoolPostgresPaiementsFacturation,
  creerPoolPostgresPaiementsFacturation,
  type FournisseurParametresSessionPostgresPaiementsFacturation,
} from './ClientPoolPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './depots/ClientPostgresPaiementsFacturation';
import { AdaptateurClientTransactionPoolPostgresPaiementsFacturation } from './transaction/AdaptateurClientTransactionPoolPostgresPaiementsFacturation';
import { PostgresUnitOfWork } from './transaction/PostgresUnitOfWork';
import {
  GestionnaireTransactionPostgresPaiements,
  type TransactionManager,
} from './transaction/TransactionManager';

// Ce fichier construit l'infrastructure PostgreSQL concrete du BC Paiements & Facturation.
export interface InfrastructurePostgresPaiementsFacturation {
  pool: Pool;
  clientLecture: ClientPostgresPaiementsFacturation;
  gestionnaireTransaction: TransactionManager<ClientPostgresPaiementsFacturation>;
  uniteDeTravail: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>;
}

// Cette fabrique centralise pool, client de lecture, transaction et contexte tenant.
export function creerInfrastructurePostgresPaiementsFacturation(
  configuration: ConfigurationPoolPostgresPaiementsFacturation =
    creerConfigurationPoolPostgresPaiementsFacturation(),
  contexteTenant?: PaiementTenantContext,
): InfrastructurePostgresPaiementsFacturation {
  const fournisseurParametresSession:
    FournisseurParametresSessionPostgresPaiementsFacturation | undefined =
      contexteTenant === undefined
        ? undefined
        : {
          obtenirParametresSession: () => {
            const etat = contexteTenant.obtenirEtatCourant();

            return {
              tenantId: etat.idEcole,
              organisationId: etat.idOrganisation,
              lectureOrganisationnelle: etat.lectureOrganisationnelle,
            };
          },
        };

  const pool = creerPoolPostgresPaiementsFacturation(configuration);
  const clientLecture = ClientPoolPostgresPaiementsFacturation.depuisPool(
    pool,
    fournisseurParametresSession,
  );
  const adaptateurTransaction =
    new AdaptateurClientTransactionPoolPostgresPaiementsFacturation(
      pool,
      fournisseurParametresSession,
    );
  const gestionnaireTransaction =
    new GestionnaireTransactionPostgresPaiements<ClientPostgresPaiementsFacturation>(
      adaptateurTransaction,
    );
  const uniteDeTravail =
    new PostgresUnitOfWork<ClientPostgresPaiementsFacturation>(
      gestionnaireTransaction,
    );

  return {
    pool,
    clientLecture,
    gestionnaireTransaction,
    uniteDeTravail,
  };
}
