import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une migration de bulletin a ete analysee.
export class MigrationBulletinAnalysee extends EvenementDomaine {
  public readonly idMigrationBulletin: string;

  constructor(idMigrationBulletin: string) {
    super('MigrationBulletinAnalysee');
    this.idMigrationBulletin = idMigrationBulletin;
  }
}
