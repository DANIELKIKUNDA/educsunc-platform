// Ce fichier decrit la commande applicative de mise en file d'une notification.

/** Cette interface porte la demande de mise en file runtime d'une notification. */
export interface CommandeMettreEnFileNotification {
  readonly identifiantNotification: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly prioriteJob?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
}
