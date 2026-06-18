// Ce fichier declare l entite de configuration runtime.

/** Cette interface represente les reglages de retry pilotables au runtime. */
export interface RuntimeRetryConfiguration {
  readonly actif: boolean;
  readonly tentativesMaximales: number;
  readonly backoffSecondes: number;
}

/** Cette interface represente les reglages de replay pilotables au runtime. */
export interface RuntimeReplayConfiguration {
  readonly actif: boolean;
  readonly tailleLotMaximale: number;
}

/** Cette interface represente les reglages de cache pilotables au runtime. */
export interface RuntimeCacheConfiguration {
  readonly ttlSecondes: number;
  readonly synchronisationActive: boolean;
}

/** Cette interface represente les reglages de rechargement et de propagation. */
export interface RuntimeReloadConfiguration {
  readonly propagationActive: boolean;
  readonly reloadRuntimeActif: boolean;
  readonly restartRequisPourClesCritiques: boolean;
}

/** Cette interface represente les reglages du scheduler runtime. */
export interface RuntimeSchedulerConfiguration {
  readonly actif: boolean;
  readonly frequenceSecondes: number;
}

/** Cette interface represente les options runtime pilotables par le module Configuration. */
export interface RuntimeConfigurationProps {
  readonly retry: RuntimeRetryConfiguration;
  readonly replay: RuntimeReplayConfiguration;
  readonly cache: RuntimeCacheConfiguration;
  readonly reload: RuntimeReloadConfiguration;
  readonly scheduler: RuntimeSchedulerConfiguration;
}

/** Cette classe represente les reglages runtime configurables. */
export class RuntimeConfiguration {
  constructor(private readonly props: RuntimeConfigurationProps) {}

  /** Cette methode retourne les options runtime brutes. */
  public valeur(): RuntimeConfigurationProps {
    return {
      retry: { ...this.props.retry },
      replay: { ...this.props.replay },
      cache: { ...this.props.cache },
      reload: { ...this.props.reload },
      scheduler: { ...this.props.scheduler },
    };
  }
}
