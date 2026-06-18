import type { AlerteProps } from '../entities';

// Ce fichier declare l evenement de resolution d une alerte.

/** Cette classe represente la resolution d une alerte. */
export class AlerteResolue {
  constructor(public readonly payload: AlerteProps) {}
}
