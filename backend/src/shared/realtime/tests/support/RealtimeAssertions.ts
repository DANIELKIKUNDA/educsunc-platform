import assert from 'node:assert/strict';

export class RealtimeAssertions {
  public static estDiffusable(valeur: boolean): void {
    assert.equal(valeur, true);
  }

  public static aAuMoinsUn<T>(elements: readonly T[]): void {
    assert.ok(elements.length > 0);
  }
}
