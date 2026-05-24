import { ObjetValeur } from '../../../domain/ValueObject';
import { TYPE_RESSOURCE_AUDIT_ENUM, type TypeRessourceAuditEnum } from '../enums';

export type TypeRessourceAuditValeur = TypeRessourceAuditEnum;

// Ce value object normalise le type de ressource concernée par l'audit.
export class TypeRessourceAudit extends ObjetValeur<{ valeur: TypeRessourceAuditValeur }> {
  public static readonly VALEURS = TYPE_RESSOURCE_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!TypeRessourceAudit.VALEURS.includes(valeur as TypeRessourceAuditValeur)) {
      throw new Error(`TypeRessourceAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as TypeRessourceAuditValeur });
  }

  public obtenirValeur(): TypeRessourceAuditValeur {
    return this.proprietes.valeur;
  }
}
