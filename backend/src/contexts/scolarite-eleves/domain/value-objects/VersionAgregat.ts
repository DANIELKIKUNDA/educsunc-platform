import { ObjetValeur } from '../../../../shared/domain/ValueObject';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';

/**
 * Ce value object porte la version metier d'un agregat.
 */
export class VersionAgregat extends ObjetValeur<{ version: number }> {
  constructor(version: number) {
    if (!Number.isInteger(version) || version <= 0) {
      throw new ValidationError('La version doit etre un entier positif.', 'VERSION_AGREGAT_INVALIDE');
    }
    super({ version });
  }

  /** Retourne la valeur numerique de version. */
  public obtenirVersion(): number {
    return this.proprietes.version;
  }
}
