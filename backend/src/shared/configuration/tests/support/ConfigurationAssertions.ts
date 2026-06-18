import assert from 'node:assert/strict';

// Ce fichier declare les assertions partagees des tests Configuration.

export class ConfigurationAssertions {
  public static contientConfigurationId(resultat: { readonly identifiant?: string }, attendu: string): void {
    assert.equal(resultat.identifiant, attendu);
  }

  public static contientWarning(resultat: { readonly warnings: readonly string[] }, fragment: string): void {
    assert.ok(resultat.warnings.some((warning) => warning.includes(fragment)));
  }
}
