import { convertirMontantEnLettres } from '../../../../shared/utils/montantEnLettres';
import type { Money } from '../../domain/value-objects/Money';

// Ce fichier encapsule la conversion shared du montant en lettres pour les usages du BC Paiements.
export class ServiceMontantEnLettresPaiement {
  // Cette methode produit une chaine propre pour impression sur un recu financier.
  public convertir(montant: Money): string {
    return convertirMontantEnLettres(montant.obtenirMontant(), {
      devise: montant.obtenirDevise(),
      majusculeInitiale: true,
    });
  }
}
