// Ce fichier expose le manifest des checks de sante du module Notifications.

/** Cette classe decrit les checks et diagnostics disponibles localement. */
export class ManifestHealthNotifications {
  /** Cette methode retourne le manifest de sante operationnelle du module. */
  public construire(): {
    readonly checks: readonly string[];
    readonly diagnostics: readonly string[];
    readonly readinessLocale: true;
  } {
    return {
      checks: [
        'healthcheck-runtime',
        'healthcheck-monitoring',
        'healthcheck-providers',
      ],
      diagnostics: [
        'diagnostic-runtime',
        'diagnostic-dead-letters',
        'diagnostic-recovery',
      ],
      readinessLocale: true,
    };
  }
}
