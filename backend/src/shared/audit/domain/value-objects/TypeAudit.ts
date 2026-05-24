import { ObjetValeur } from '../../../domain/ValueObject';
import { TYPE_AUDIT_ENUM, type TypeAuditEnum } from '../enums';

export type TypeAuditValeur = TypeAuditEnum;

// Ce value object encadre la nature officielle d'un audit.
export class TypeAudit extends ObjetValeur<{ valeur: TypeAuditValeur }> {
  public static readonly VALEURS = TYPE_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!TypeAudit.VALEURS.includes(valeur as TypeAuditValeur)) {
      throw new Error(`TypeAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as TypeAuditValeur });
  }

  public obtenirValeur(): TypeAuditValeur {
    return this.proprietes.valeur;
  }
}
