import type { Pool } from 'pg';
import { ContexteTenant } from 'shared/tenancy/TenantContext';
import { BulletinTenantResolver } from '../../tenancy/BulletinTenantResolver';
import {
  ClientPoolPostgresBulletinsEvaluations,
  type ConfigurationPoolPostgresBulletinsEvaluations,
  creerConfigurationPoolPostgresBulletinsEvaluations,
  creerPoolPostgresBulletinsEvaluations,
  type FournisseurParametresSessionPostgresBulletinsEvaluations,
} from './ClientPoolPostgresBulletinsEvaluations';
import { PostgresBulletinUnitOfWork } from './transaction/PostgresBulletinUnitOfWork';
import {
  BulletinTransactionManager,
  type TransactionManager,
} from './transaction/TransactionManager';

// Cette interface regroupe les briques PostgreSQL pretes a etre injectees dans le BC.
export interface InfrastructurePostgresBulletinsEvaluations {
  pool: Pool;
  clientLecture: ClientPoolPostgresBulletinsEvaluations;
  gestionnaireTransaction: TransactionManager;
  uniteDeTravail: PostgresBulletinUnitOfWork;
}

// Cette fonction construit l'infrastructure PostgreSQL concrete du BC Bulletins.
export function creerInfrastructurePostgresBulletinsEvaluations(
  configuration: ConfigurationPoolPostgresBulletinsEvaluations =
    creerConfigurationPoolPostgresBulletinsEvaluations(),
  contexteTenant?: ContexteTenant,
): InfrastructurePostgresBulletinsEvaluations {
  const resolveurTenant =
    contexteTenant === undefined ? undefined : new BulletinTenantResolver(contexteTenant);
  const fournisseurParametresSession:
    FournisseurParametresSessionPostgresBulletinsEvaluations | undefined =
      resolveurTenant === undefined
        ? undefined
        : {
          obtenirParametresSession: () => ({
            'app.tenant_id': resolveurTenant.obtenirIdEcoleCourante(),
            'app.organisation_id': resolveurTenant.obtenirIdOrganisationCourante(),
          }),
        };

  const pool = creerPoolPostgresBulletinsEvaluations(configuration);
  const clientLecture = ClientPoolPostgresBulletinsEvaluations.depuisPool(pool, fournisseurParametresSession);
  const gestionnaireTransaction = new BulletinTransactionManager(pool, fournisseurParametresSession);
  const uniteDeTravail = new PostgresBulletinUnitOfWork(gestionnaireTransaction);

  return {
    pool,
    clientLecture,
    gestionnaireTransaction,
    uniteDeTravail,
  };
}
