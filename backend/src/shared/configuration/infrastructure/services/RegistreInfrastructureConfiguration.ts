import {
  CacheConfigurationEffective,
  CacheSnapshotsConfiguration,
  CacheValidationConfiguration,
} from '../cache';
import {
  CollecteurMonitoringConfiguration,
  CollecteurSanteConfiguration,
} from '../monitoring';
import {
  PropagateurConfiguration,
  PropagateurModulesConfiguration,
  PropagateurOverridesConfiguration,
} from '../propagation';
import {
  RepositoryConfigurationMemoire,
  RepositoryConfigurationSnapshotMemoire,
  RepositoryConfigurationVersionMemoire,
} from '../repositories';
import {
  RechargeurModulesConfiguration,
  RechargeurRuntimeConfiguration,
} from '../reload';

// Ce fichier declare le registre technique de l infrastructure Configuration.

/** Cette classe centralise les composants techniques reutilisables de l infrastructure. */
export class RegistreInfrastructureConfiguration {
  public readonly repositoryConfiguration = new RepositoryConfigurationMemoire();
  public readonly repositoryVersions = new RepositoryConfigurationVersionMemoire();
  public readonly repositorySnapshots = new RepositoryConfigurationSnapshotMemoire();
  public readonly cacheEffectif = new CacheConfigurationEffective();
  public readonly cacheSnapshots = new CacheSnapshotsConfiguration();
  public readonly cacheValidation = new CacheValidationConfiguration();
  public readonly propagateur = new PropagateurConfiguration();
  public readonly propagateurOverrides = new PropagateurOverridesConfiguration();
  public readonly propagateurModules = new PropagateurModulesConfiguration();
  public readonly rechargeurRuntime = new RechargeurRuntimeConfiguration();
  public readonly rechargeurModules = new RechargeurModulesConfiguration();
  public readonly monitoring = new CollecteurMonitoringConfiguration();
  public readonly sante = new CollecteurSanteConfiguration();
}
