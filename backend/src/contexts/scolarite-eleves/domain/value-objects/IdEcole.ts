import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';

/**
 * Ce value object represente IdEcole.
 */
export class IdEcole extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    if (!/^[0-9a-fA-F-]{36}$/.test(valeur)) {
      throw new ValidationError('IdEcole doit etre un UUID valide.', 'IDECOLE_INVALIDE');
    }
    super({ valeur });
  }

  /** Retourne la valeur brute de l'identifiant. */
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
