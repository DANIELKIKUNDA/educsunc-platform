// Ce fichier expose le manifest runtime local du module Notifications.

/** Cette classe decrit les capacites runtime que le module sait activer localement. */
export class ManifestRuntimeNotifications {
  /** Cette methode retourne le manifest runtime stable du module Notifications. */
  public construire(): {
    readonly module: 'notifications';
    readonly supportLocal: true;
    readonly composants: readonly string[];
    readonly operations: readonly string[];
  } {
    return {
      module: 'notifications',
      supportLocal: true,
      composants: [
        'runtime',
        'monitoring',
        'scheduler',
        'throttling',
        'recovery',
      ],
      operations: [
        'executer-cycle-global',
        'observer-etat',
        'arreter-runtime',
      ],
    };
  }
}
