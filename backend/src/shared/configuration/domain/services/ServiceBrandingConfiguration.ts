import { BrandingConfiguration } from '../entities';

// Ce fichier declare le service metier de branding.

/** Cette classe centralise les regles de lecture utiles du branding. */
export class ServiceBrandingConfiguration {
  /** Cette methode retourne le nom logique d un branding complet ou incomplet. */
  public qualifier(branding: BrandingConfiguration): 'COMPLET' | 'PARTIEL' {
    const valeur = branding.valeur();
    return valeur.logoPrincipal && valeur.couleurPrincipale ? 'COMPLET' : 'PARTIEL';
  }
}
