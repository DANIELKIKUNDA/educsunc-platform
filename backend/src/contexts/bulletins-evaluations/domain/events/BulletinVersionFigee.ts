import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une version de bulletin a ete figee.
export class BulletinVersionFigee extends EvenementDomaine {
  public readonly idBulletinEleve: string;
  public readonly versionBulletin: number;

  constructor(idBulletinEleve: string, versionBulletin: number) {
    super('BulletinVersionFigee');
    this.idBulletinEleve = idBulletinEleve;
    this.versionBulletin = versionBulletin;
  }
}
