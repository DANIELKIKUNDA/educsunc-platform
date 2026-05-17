import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une migration de bulletin a ete appliquee.
export class MigrationBulletinAppliquee extends EvenementDomaine {
  public readonly idMigrationBulletin: string;

  constructor(idMigrationBulletin: string) {
    super('MigrationBulletinAppliquee');
    this.idMigrationBulletin = idMigrationBulletin;
  }
}
