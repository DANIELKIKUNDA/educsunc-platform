import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'un bulletin a ete genere.
export class BulletinGenere extends EvenementDomaine {
  public readonly idBulletinEleve: string;
  public readonly idEleve: string;

  constructor(idBulletinEleve: string, idEleve: string) {
    super('BulletinGenere');
    this.idBulletinEleve = idBulletinEleve;
    this.idEleve = idEleve;
  }
}
