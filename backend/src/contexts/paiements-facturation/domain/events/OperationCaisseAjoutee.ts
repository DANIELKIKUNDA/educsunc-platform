import { EvenementDomaine } from '../../../../shared/domain/DomainEvent';

export class OperationCaisseAjoutee extends EvenementDomaine {
  public readonly idCaisseJour: string;
  public readonly idOperation: string;
  public readonly idEcole: string;

  constructor(idCaisseJour: string, idOperation: string, idEcole: string) {
    super('OperationCaisseAjoutee');
    this.idCaisseJour = idCaisseJour;
    this.idOperation = idOperation;
    this.idEcole = idEcole;
  }
}
