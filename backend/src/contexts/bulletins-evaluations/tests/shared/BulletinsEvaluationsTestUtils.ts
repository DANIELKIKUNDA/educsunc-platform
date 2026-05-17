import { ContexteTenant } from 'shared/tenancy/TenantContext';
import { obtenirMemoireTechniqueBulletins } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier regroupe des utilitaires transverses pour nettoyer et preparer les tests du BC.
export function reinitialiserMemoireBulletins(): void {
  const memoire = obtenirMemoireTechniqueBulletins();
  memoire.auditsEncodage.clear();
  memoire.operationsOffline.clear();
  memoire.projectionsBulletins.clear();
  memoire.projectionsClassements.clear();
  memoire.projectionsProclamations.clear();
  memoire.projectionsStatistiques.clear();
  memoire.projectionsSyntheses.clear();
  memoire.snapshotsBulletins.clear();
  memoire.archivesBulletins.clear();
  memoire.journauxProjection.clear();
}

// Cette fonction cree un contexte tenant propre a chaque test.
export function creerContexteTenant(idTenant = 'ecole-1', idOrganisation = 'organisation-1'): ContexteTenant {
  const contexteTenant = new ContexteTenant();
  contexteTenant.definirTenant(idTenant);
  contexteTenant.definirOrganisation(idOrganisation);
  return contexteTenant;
}
