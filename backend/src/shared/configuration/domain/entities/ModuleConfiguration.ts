import {
  StatutLicenceConfiguration,
  TypeFeatureConfiguration,
  TypeModuleConfiguration,
} from '../enums';

// Ce fichier declare l entite de modularite commerciale.

/** Cette interface represente la configuration des modules et features d une ecole. */
export interface FeatureFlagConfiguration {
  readonly feature: TypeFeatureConfiguration;
  readonly statut: 'ACTIVE' | 'DISABLED' | 'EXPERIMENTAL' | 'PLAN_RESERVED';
  readonly raison?: string;
}

/** Cette interface represente un module additionnel achetable au niveau ecole. */
export interface ModuleAdditionnelConfiguration {
  readonly module: TypeModuleConfiguration;
  readonly actif: boolean;
  readonly acquisLe?: Date;
}

/** Cette interface represente la configuration des modules et features d une ecole. */
export interface ModuleConfigurationProps {
  readonly uniteCommerciale: 'SCHOOL';
  readonly plan: string;
  readonly statutLicence: StatutLicenceConfiguration;
  readonly modeEssaiActif: boolean;
  readonly expireLe?: Date;
  readonly modulesActifs: readonly TypeModuleConfiguration[];
  readonly modulesAdditionnels: readonly ModuleAdditionnelConfiguration[];
  readonly featuresActives: readonly TypeFeatureConfiguration[];
  readonly featuresParModule: Readonly<
  Partial<Record<TypeModuleConfiguration, readonly FeatureFlagConfiguration[]>>
  >;
  readonly quotas: Readonly<Record<string, number>>;
}

/** Cette classe represente la modularite commerciale configurable. */
export class ModuleConfiguration {
  constructor(private readonly props: ModuleConfigurationProps) {}

  /** Cette methode indique si un module est actif. */
  public moduleActif(module: TypeModuleConfiguration): boolean {
    return this.props.modulesActifs.includes(module);
  }

  /** Cette methode indique si une feature peut etre utilisee au regard du plan et du module. */
  public featureActive(
    module: TypeModuleConfiguration,
    feature: TypeFeatureConfiguration,
  ): boolean {
    const flags = this.props.featuresParModule[module] ?? [];
    const featureFlag = flags.find((flag) => flag.feature === feature);

    if (featureFlag) {
      return featureFlag.statut === 'ACTIVE';
    }

    return this.props.featuresActives.includes(feature) && this.moduleActif(module);
  }

  /** Cette methode retourne les donnees de modularite. */
  public valeur(): ModuleConfigurationProps {
    return {
      ...this.props,
      modulesActifs: [...this.props.modulesActifs],
      modulesAdditionnels: this.props.modulesAdditionnels.map((module) => ({ ...module })),
      featuresActives: [...this.props.featuresActives],
      featuresParModule: Object.fromEntries(
        Object.entries(this.props.featuresParModule).map(([module, flags]) => [
          module,
          (flags ?? []).map((flag) => ({ ...flag })),
        ]),
      ),
      quotas: { ...this.props.quotas },
    };
  }
}
