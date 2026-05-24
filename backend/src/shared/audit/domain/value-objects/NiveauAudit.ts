import { ObjetValeur } from '../../../domain/ValueObject';
import { NIVEAU_AUDIT_ENUM, type NiveauAuditEnum } from '../enums';

export type NiveauAuditValeur = NiveauAuditEnum;

// Ce value object porte le niveau fonctionnel d'un audit.
export class NiveauAudit extends ObjetValeur<{ valeur: NiveauAuditValeur }> {
  public static readonly VALEURS = NIVEAU_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!NiveauAudit.VALEURS.includes(valeur as NiveauAuditValeur)) {
      throw new Error(`NiveauAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as NiveauAuditValeur });
  }

  public obtenirValeur(): NiveauAuditValeur {
    return this.proprietes.valeur;
  }
}
