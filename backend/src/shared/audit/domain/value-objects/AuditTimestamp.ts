import { ObjetValeur } from '../../../domain/ValueObject';

export interface ProprietesAuditTimestamp {
  dateAction: Date;
  dateCreationAudit: Date;
  dateSynchronisation?: Date;
}

// Ce value object regroupe les horodatages métiers de l'audit.
export class AuditTimestamp extends ObjetValeur<ProprietesAuditTimestamp> {
  constructor(proprietes: ProprietesAuditTimestamp) {
    AuditTimestamp.validerDate(proprietes.dateAction, 'dateAction');
    AuditTimestamp.validerDate(proprietes.dateCreationAudit, 'dateCreationAudit');
    if (proprietes.dateSynchronisation) {
      AuditTimestamp.validerDate(proprietes.dateSynchronisation, 'dateSynchronisation');
    }
    super({
      dateAction: new Date(proprietes.dateAction.getTime()),
      dateCreationAudit: new Date(proprietes.dateCreationAudit.getTime()),
      dateSynchronisation: proprietes.dateSynchronisation
        ? new Date(proprietes.dateSynchronisation.getTime())
        : undefined,
    });
  }

  public obtenirDateAction(): Date {
    return new Date(this.proprietes.dateAction.getTime());
  }

  public obtenirDateCreationAudit(): Date {
    return new Date(this.proprietes.dateCreationAudit.getTime());
  }

  public obtenirDateSynchronisation(): Date | undefined {
    return this.proprietes.dateSynchronisation
      ? new Date(this.proprietes.dateSynchronisation.getTime())
      : undefined;
  }

  public estOffline(): boolean {
    return this.proprietes.dateAction.getTime() !== this.proprietes.dateCreationAudit.getTime();
  }

  private static validerDate(valeur: Date, champ: string): void {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${champ} est invalide.`);
    }
  }
}
