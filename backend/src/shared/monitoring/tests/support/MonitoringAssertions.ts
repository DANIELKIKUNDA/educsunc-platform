import assert from 'node:assert/strict';

// Ce fichier declare les assertions utilitaires des tests Monitoring.

export class MonitoringAssertions {
  public static estCritique(niveau: string): void {
    assert.equal(niveau, 'CRITICAL');
  }

  public static contientCorrelation<T extends { readonly correlation?: { readonly correlationId?: string } }>(
    valeur: T,
    correlationId: string,
  ): void {
    assert.equal(valeur.correlation?.correlationId, correlationId);
  }
}
