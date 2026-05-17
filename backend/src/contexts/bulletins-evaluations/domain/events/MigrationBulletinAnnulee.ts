import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une migration de bulletin a ete annulee.
export class MigrationBulletinAnnulee extends EvenementDomaine {
  public readonly idMigrationBulletin: string;

  constructor(idMigrationBulletin: string) {
    super('MigrationBulletinAnnulee');
    this.idMigrationBulletin = idMigrationBulletin;
  }
}
