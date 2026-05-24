import { ObjetValeur } from '../../../domain/ValueObject';
import { STATUT_SYNCHRONISATION_AUDIT_ENUM, type StatutSynchronisationAuditEnum } from '../enums';

export type StatutSynchronisationAuditValeur = StatutSynchronisationAuditEnum;

// Ce value object suit l'etat de vie d'un audit offline-first.
export class StatutSynchronisationAudit extends ObjetValeur<{ valeur: StatutSynchronisationAuditValeur }> {
  public static readonly VALEURS = STATUT_SYNCHRONISATION_AUDIT_ENUM;

  constructor(valeur: string) {
    if (!StatutSynchronisationAudit.VALEURS.includes(valeur as StatutSynchronisationAuditValeur)) {
      throw new Error(`StatutSynchronisationAudit invalide: ${valeur}`);
    }
    super({ valeur: valeur as StatutSynchronisationAuditValeur });
  }

  public obtenirValeur(): StatutSynchronisationAuditValeur {
    return this.proprietes.valeur;
  }
}
