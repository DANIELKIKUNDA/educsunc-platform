import assert from 'node:assert/strict';

export function assertContainsEventNames(actual: readonly string[], expected: readonly string[]): void {
  for (const eventName of expected) {
    assert.ok(
      actual.includes(eventName),
      `L evenement ${eventName} devrait etre present dans la liste observee.`,
    );
  }
}
