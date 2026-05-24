import { AuditInvalidClassificationException } from '../exceptions';
import { TypeAudit } from '../value-objects';

// Cette policy force une classification principale cohérente avec les catégories associées.
export class PolicyAuditClassification {
  public static verifier(typeAuditPrincipal: TypeAudit, categoriesAudit: TypeAudit[]): void {
    if (categoriesAudit.length === 0) {
      throw new AuditInvalidClassificationException("Une entree audit doit posseder au moins une categorie.");
    }
    if (!categoriesAudit.some((categorie) => categorie.obtenirValeur() === typeAuditPrincipal.obtenirValeur())) {
      throw new AuditInvalidClassificationException("La categorie principale doit exister dans la liste des categories.");
    }
  }
}
