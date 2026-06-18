import { ConfigurationId } from '../../domain';
import { EnregistrementVersionConfigurationMemoire } from './TypesPersistenceConfiguration';

// Ce fichier declare le stockage technique des versions en memoire.

/** Cette classe represente le stockage local memoire des versions de configuration. */
export class StockageVersionsConfigurationMemoire {
  private readonly enregistrements = new Map<string, EnregistrementVersionConfigurationMemoire[]>();

  /** Cette methode ajoute une version a l historique local. */
  public ajouter(
    identifiant: ConfigurationId,
    enregistrement: EnregistrementVersionConfigurationMemoire,
  ): void {
    const versions = this.enregistrements.get(identifiant.valeur()) ?? [];
    versions.push(enregistrement);
    this.enregistrements.set(identifiant.valeur(), versions);
  }

  /** Cette methode retourne l historique des versions connues. */
  public listerParConfiguration(
    identifiant: ConfigurationId,
  ): readonly EnregistrementVersionConfigurationMemoire[] {
    return [...(this.enregistrements.get(identifiant.valeur()) ?? [])];
  }
}
