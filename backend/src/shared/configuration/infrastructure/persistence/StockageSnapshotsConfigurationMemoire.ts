import { ConfigurationId } from '../../domain';
import { EnregistrementSnapshotConfigurationMemoire } from './TypesPersistenceConfiguration';

// Ce fichier declare le stockage technique des snapshots en memoire.

/** Cette classe represente le stockage local memoire des snapshots de configuration. */
export class StockageSnapshotsConfigurationMemoire {
  private readonly enregistrements = new Map<string, EnregistrementSnapshotConfigurationMemoire[]>();

  /** Cette methode ajoute un snapshot a l historique local. */
  public ajouter(
    identifiant: ConfigurationId,
    enregistrement: EnregistrementSnapshotConfigurationMemoire,
  ): void {
    const snapshots = this.enregistrements.get(identifiant.valeur()) ?? [];
    snapshots.push(enregistrement);
    this.enregistrements.set(identifiant.valeur(), snapshots);
  }

  /** Cette methode retourne l historique des snapshots connus. */
  public listerParConfiguration(
    identifiant: ConfigurationId,
  ): readonly EnregistrementSnapshotConfigurationMemoire[] {
    return [...(this.enregistrements.get(identifiant.valeur()) ?? [])];
  }
}
