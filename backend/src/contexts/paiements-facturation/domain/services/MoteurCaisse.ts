import { CaisseJour } from '../aggregates/CaisseJour';
import { OperationCaisse } from '../entities/OperationCaisse';

export class MoteurCaisse {
  public enregistrerOperation(caisse: CaisseJour, operation: OperationCaisse): void {
    caisse.ajouterOperation(operation);
  }
}
