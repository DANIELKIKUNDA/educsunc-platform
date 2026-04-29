import { ConflitPaiementDetecte } from '../events/ConflitPaiementDetecte';
import { ErreurConflitConcurrenceFinanciere } from '../exceptions/ErreurConflitConcurrenceFinanciere';

export class MoteurConcurrenceFinanciere {
  public verifierVersion(referencePaiement: string, referenceObligation: string, idEcole: string, versionAttendue: number, versionCourante: number): void {
    if (!Number.isInteger(versionAttendue) || versionAttendue <= 0 || versionAttendue !== versionCourante) {
      new ConflitPaiementDetecte(referencePaiement, referenceObligation, idEcole);
      throw new ErreurConflitConcurrenceFinanciere();
    }
  }
}
