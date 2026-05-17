import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une transformation de cote de migration a ete enregistree.
export class TransformationCoteBulletinEnregistree extends EvenementDomaine {
  public readonly idMigrationBulletin: string;
  public readonly idTransformationCoteBulletin: string;

  constructor(idMigrationBulletin: string, idTransformationCoteBulletin: string) {
    super('TransformationCoteBulletinEnregistree');
    this.idMigrationBulletin = idMigrationBulletin;
    this.idTransformationCoteBulletin = idTransformationCoteBulletin;
  }
}
