// Ce fichier declare la configuration technique des templates du module Notifications.

/** Cette interface represente la configuration de rendu et de cache des templates. */
export interface ConfigurationTemplateNotification {
  readonly renduStrict: boolean;
  readonly placeholdersRequis: readonly string[];
  readonly ttlCacheMs: number;
  readonly autoriserFallbackContenu: boolean;
}

/** Cette classe centralise la configuration technique de templating Notifications. */
export class ConfigurationTemplatesNotification {
  /** Cette configuration represente l'etat courant du moteur de templates. */
  private configurationCourante: ConfigurationTemplateNotification;

  /** Ce constructeur initialise les valeurs techniques par defaut des templates. */
  constructor(configurationInitiale?: Partial<ConfigurationTemplateNotification>) {
    this.configurationCourante = {
      renduStrict: true,
      placeholdersRequis: Object.freeze(['organisationId', 'ecoleId', 'acteurId']),
      ttlCacheMs: 300_000,
      autoriserFallbackContenu: false,
      ...configurationInitiale,
    };
  }

  /** Cette methode retourne la configuration technique des templates. */
  public obtenirConfiguration(): ConfigurationTemplateNotification {
    return this.configurationCourante;
  }

  /** Cette methode fusionne une nouvelle configuration technique de templates. */
  public definirConfiguration(configuration: Partial<ConfigurationTemplateNotification>): void {
    this.configurationCourante = {
      ...this.configurationCourante,
      ...configuration,
      placeholdersRequis: Object.freeze(
        configuration.placeholdersRequis ?? this.configurationCourante.placeholdersRequis,
      ),
    };
  }

  /** Cette methode expose un fragment plat reutilisable par la configuration runtime. */
  public convertirEnFragmentRuntime(): Readonly<Record<string, unknown>> {
    return {
      'notifications.templates.strictRendering': this.configurationCourante.renduStrict,
      'notifications.templates.requiredPlaceholders': this.configurationCourante.placeholdersRequis,
      'notifications.templates.cacheTtlMs': this.configurationCourante.ttlCacheMs,
      'notifications.templates.allowFallbackContent': this.configurationCourante.autoriserFallbackContenu,
    };
  }
}
