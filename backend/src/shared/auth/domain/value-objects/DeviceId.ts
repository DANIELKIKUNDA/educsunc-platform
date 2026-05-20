import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente un identifiant technique d'appareil connu.
export class DeviceId extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const deviceId = String(valeur || '').trim();
    if (!deviceId) {
      throw new Error('Le deviceId est obligatoire.');
    }

    super({ valeur: deviceId });
  }

  // Cette methode retourne l'identifiant d'appareil transporte par le domaine.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
