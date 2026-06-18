import type { AlerteProps } from '../entities';

// Ce fichier declare l evenement de declenchement d une alerte.

/** Cette classe represente l emission d une alerte. */
export class AlerteDeclenchee {
  constructor(public readonly payload: AlerteProps) {}
}
