import { type Pool } from 'pg';
import type { Journaliseur } from '../../../../../shared/infrastructure/logger/Logger';
import { JournaliseurPino } from '../../../../../shared/infrastructure/logger/PinoLogger';
import { ContexteExecutionTenantReferentielAcademique } from '../../tenancy/ContexteExecutionTenantReferentielAcademique';
import {
  ClientPoolPostgresReferentielAcademique,
  ConfigurationPoolPostgresReferentielAcademique,
  creerConfigurationPoolPostgresReferentielAcademique,
  creerPoolPostgresReferentielAcademique,
  FournisseurParametresSessionPostgresReferentielAcademique,
} from './ClientPoolPostgresReferentielAcademique';
import type { ClientPostgresReferentielAcademique } from './depots/ClientPostgresReferentielAcademique';
import { MigrateurPostgresReferentielAcademique } from './MigrateurPostgresReferentielAcademique';
import { PostgresUnitOfWork } from './transaction/PostgresUnitOfWork';
import { AdaptateurClientTransactionPoolPostgresReferentielAcademique } from './transaction/AdaptateurClientTransactionPoolPostgresReferentielAcademique';
import { GestionnaireTransactionPostgres } from './transaction/TransactionManager';

// Cette interface regroupe les composants techniques PostgreSQL prets a etre injectes dans le BC.
export interface InfrastructurePostgresReferentielAcademique {
  pool: Pool;
  clientLecture: ClientPostgresReferentielAcademique;
  gestionnaireTransaction: GestionnaireTransactionPostgres<ClientPostgresReferentielAcademique>;
  uniteDeTravail: PostgresUnitOfWork<ClientPostgresReferentielAcademique>;
  migrateur: MigrateurPostgresReferentielAcademique;
}

// Cette fonction construit l'infrastructure PostgreSQL concrete du BC Referentiel Academique.
export function creerInfrastructurePostgresReferentielAcademique(
  configuration: ConfigurationPoolPostgresReferentielAcademique = creerConfigurationPoolPostgresReferentielAcademique(),
  journaliseur: Journaliseur = new JournaliseurPino(),
  contexteExecutionTenant?: ContexteExecutionTenantReferentielAcademique,
): InfrastructurePostgresReferentielAcademique {
  const fournisseurParametresSession:
    FournisseurParametresSessionPostgresReferentielAcademique | undefined =
      contexteExecutionTenant === undefined
        ? undefined
        : {
          obtenirParametresSession: () => {
            const etatContexteTenant = contexteExecutionTenant.obtenirEtatCourant();

            return {
              tenantId: etatContexteTenant.idTenant,
              organisationId: etatContexteTenant.idOrganisation,
              lectureOrganisationnelle: etatContexteTenant.lectureOrganisationnelle,
            };
          },
        };
  const pool = creerPoolPostgresReferentielAcademique(configuration);
  const clientLecture = ClientPoolPostgresReferentielAcademique.depuisPool(
    pool,
    fournisseurParametresSession,
  );
  const adaptateurTransaction =
    new AdaptateurClientTransactionPoolPostgresReferentielAcademique(
      pool,
      fournisseurParametresSession,
    );
  const gestionnaireTransaction =
    new GestionnaireTransactionPostgres<ClientPostgresReferentielAcademique>(
      adaptateurTransaction,
    );
  const uniteDeTravail =
    new PostgresUnitOfWork<ClientPostgresReferentielAcademique>(gestionnaireTransaction);
  const migrateur = new MigrateurPostgresReferentielAcademique(pool, journaliseur);

  return {
    pool,
    clientLecture,
    gestionnaireTransaction,
    uniteDeTravail,
    migrateur,
  };
}
