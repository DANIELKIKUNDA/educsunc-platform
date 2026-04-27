import { type Pool } from 'pg';
import {
  ClientPoolPostgresScolariteEleves,
  type ConfigurationPoolPostgresScolariteEleves,
  creerConfigurationPoolPostgresScolariteEleves,
  creerPoolPostgresScolariteEleves,
  type FournisseurParametresSessionPostgresScolariteEleves,
} from './ClientPoolPostgresScolariteEleves';
import type { ClientPostgresScolariteEleves } from './depots/ClientPostgresScolariteEleves';
import { AdaptateurClientTransactionPoolPostgresScolariteEleves } from './transaction/AdaptateurClientTransactionPoolPostgresScolariteEleves';
import { PostgresUnitOfWork } from './transaction/PostgresUnitOfWork';
import {
  GestionnaireTransactionPostgresScolarite,
  type TransactionManager,
} from './transaction/TransactionManager';
import { ScolariteTenantContext } from '../../tenancy/ScolariteTenantContext';

// Ce fichier construit l'infrastructure PostgreSQL concrete du BC Scolarite des Eleves.
export interface InfrastructurePostgresScolariteEleves {
  pool: Pool;
  clientLecture: ClientPostgresScolariteEleves;
  gestionnaireTransaction: TransactionManager<ClientPostgresScolariteEleves>;
  uniteDeTravail: PostgresUnitOfWork<ClientPostgresScolariteEleves>;
}

/**
 * Cette fabrique centralise pool, client de lecture, transactions et parametres tenant.
 */
export function creerInfrastructurePostgresScolariteEleves(
  configuration: ConfigurationPoolPostgresScolariteEleves =
    creerConfigurationPoolPostgresScolariteEleves(),
  contexteTenant?: ScolariteTenantContext,
): InfrastructurePostgresScolariteEleves {
  const fournisseurParametresSession:
    FournisseurParametresSessionPostgresScolariteEleves | undefined =
      contexteTenant === undefined
        ? undefined
        : {
          obtenirParametresSession: () => {
            const etatTenant = contexteTenant.obtenirEtatCourant();

            return {
              tenantId: etatTenant.idEcole || null,
              organisationId: etatTenant.idOrganisation,
              lectureOrganisationnelle: etatTenant.lectureOrganisationnelle,
            };
          },
        };

  const pool = creerPoolPostgresScolariteEleves(configuration);
  const clientLecture = ClientPoolPostgresScolariteEleves.depuisPool(
    pool,
    fournisseurParametresSession,
  );
  const adaptateurTransaction =
    new AdaptateurClientTransactionPoolPostgresScolariteEleves(
      pool,
      fournisseurParametresSession,
    );
  const gestionnaireTransaction =
    new GestionnaireTransactionPostgresScolarite<ClientPostgresScolariteEleves>(
      adaptateurTransaction,
    );
  const uniteDeTravail =
    new PostgresUnitOfWork<ClientPostgresScolariteEleves>(gestionnaireTransaction);

  return {
    pool,
    clientLecture,
    gestionnaireTransaction,
    uniteDeTravail,
  };
}
