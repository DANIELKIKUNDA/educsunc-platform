import { ErreurColonneProclameeVerrouillee } from '../exceptions/ErreurColonneProclameeVerrouillee';
import { EtatProclamation } from '../value-objects/EtatProclamation';

// Cette policy empeche les modifications silencieuses sur une colonne deja proclamee.
export class PolicyColonneProclameeVerrouillee {
  // Cette methode verifie si une modification normale reste autorisee.
  public verifier(
    estDejaProclamee: boolean,
    etatProclamation: EtatProclamation | undefined,
    motifModification?: string,
    modificationControlee = false,
  ): void {
    if (!estDejaProclamee) {
      return;
    }

    if (etatProclamation === EtatProclamation.VERROUILLEE) {
      throw new ErreurColonneProclameeVerrouillee();
    }

    if (!modificationControlee) {
      throw new ErreurColonneProclameeVerrouillee(
        'Une colonne deja proclamee exige une modification controlee avec motif.',
      );
    }

    if ((motifModification ?? '').trim().length === 0) {
      throw new ErreurColonneProclameeVerrouillee(
        'Un motif est obligatoire pour modifier une colonne deja proclamee.',
      );
    }
  }
}
