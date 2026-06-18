import {
  DiagnosticConfiguration,
  DiagnosticPropagationConfiguration,
  DiagnosticReloadConfiguration,
} from '../diagnostics';
import { SnapshotCacheConfiguration } from '../cache';
import { RegistreInfrastructureConfiguration } from './RegistreInfrastructureConfiguration';

// Ce fichier declare la facade technique de l infrastructure Configuration.

/** Cette classe centralise les usages techniques transverses de l infrastructure. */
export class FacadeInfrastructureConfiguration {
  private readonly diagnosticCache = new DiagnosticConfiguration();
  private readonly diagnosticPropagation = new DiagnosticPropagationConfiguration();
  private readonly diagnosticReload = new DiagnosticReloadConfiguration();

  constructor(private readonly registre = new RegistreInfrastructureConfiguration()) {}

  /** Cette methode retourne l ensemble des composants techniques enregistres. */
  public composants(): RegistreInfrastructureConfiguration {
    return this.registre;
  }

  /** Cette methode construit un snapshot technique de cache. */
  public snapshotCache(): SnapshotCacheConfiguration {
    return {
      effectif: this.registre.cacheEffectif.snapshot(),
      snapshots: this.registre.cacheSnapshots.snapshot(),
      validations: this.registre.cacheValidation.snapshot(),
    };
  }

  /** Cette methode retourne un diagnostic consolide de l infrastructure. */
  public diagnostiquer(): {
    readonly cache: readonly ReturnType<DiagnosticConfiguration['analyserCache']>[number][];
    readonly propagation: readonly ReturnType<DiagnosticPropagationConfiguration['analyser']>[number][];
    readonly reload: readonly ReturnType<DiagnosticReloadConfiguration['analyser']>[number][];
  } {
    return {
      cache: this.diagnosticCache.analyserCache(this.snapshotCache()),
      propagation: this.diagnosticPropagation.analyser(this.registre.propagateur.journal()),
      reload: this.diagnosticReload.analyser(this.registre.rechargeurRuntime.journal()),
    };
  }
}
