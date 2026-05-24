import { ObjetValeur } from '../../../domain/ValueObject';
import { AuditSnapshotData, type ValeurAuditSnapshot } from './AuditSnapshotData';

// Ce value object expose la règle officielle de nettoyage des données sensibles.
export class MasquageDonneesSensibles extends ObjetValeur<{ actif: true }> {
  constructor() {
    super({ actif: true });
  }

  public nettoyer(valeur?: ValeurAuditSnapshot): Record<string, unknown> | undefined {
    return AuditSnapshotData.nettoyerObjet(valeur);
  }
}
