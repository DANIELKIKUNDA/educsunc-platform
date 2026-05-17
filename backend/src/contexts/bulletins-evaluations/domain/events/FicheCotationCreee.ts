import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

// Cet evenement indique qu'une nouvelle fiche de cotation a ete creee.
export class FicheCotationCreee extends EvenementDomaine {
  public readonly idFicheCotationEleveCours: string;
  public readonly idEcole: string;
  public readonly idEleve: string;

  constructor(idFicheCotationEleveCours: string, idEcole: string, idEleve: string) {
    super('FicheCotationCreee');
    this.idFicheCotationEleveCours = idFicheCotationEleveCours;
    this.idEcole = idEcole;
    this.idEleve = idEleve;
  }
}
