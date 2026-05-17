import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un bulletin a ete mis a jour.
export class BulletinMisAJour extends EvenementDomaine {
  public readonly idBulletinEleve: string;

  constructor(idBulletinEleve: string) {
    super('BulletinMisAJour');
    this.idBulletinEleve = idBulletinEleve;
  }
}
