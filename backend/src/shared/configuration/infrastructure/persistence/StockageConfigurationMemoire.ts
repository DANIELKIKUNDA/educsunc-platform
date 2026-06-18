import { ConfigurationId } from '../../domain';
import { EnregistrementConfigurationMemoire } from './TypesPersistenceConfiguration';

// Ce fichier declare le stockage technique principal en memoire.

/** Cette classe represente le stockage local memoire des configurations. */
export class StockageConfigurationMemoire {
  private readonly enregistrements = new Map<string, EnregistrementConfigurationMemoire>();

  /** Cette methode sauvegarde ou remplace un enregistrement. */
  public enregistrer(identifiant: ConfigurationId, enregistrement: EnregistrementConfigurationMemoire): void {
    this.enregistrements.set(identifiant.valeur(), enregistrement);
  }

  /** Cette methode retourne un enregistrement par identifiant si present. */
  public lire(identifiant: ConfigurationId): EnregistrementConfigurationMemoire | null {
    return this.enregistrements.get(identifiant.valeur()) ?? null;
  }

  /** Cette methode supprime un enregistrement existant. */
  public supprimer(identifiant: ConfigurationId): void {
    this.enregistrements.delete(identifiant.valeur());
  }

  /** Cette methode liste l ensemble des enregistrements memorises. */
  public lister(): readonly EnregistrementConfigurationMemoire[] {
    return [...this.enregistrements.values()];
  }
}
