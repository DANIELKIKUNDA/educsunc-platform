import { ObjetValeur } from '../../../domain/ValueObject';

// Cet objet valeur represente une adresse IPv4 ou IPv6 valide.
export class AdresseIp extends ObjetValeur<{ valeur: string }> {
  constructor(valeur: string) {
    const ip = String(valeur || '').trim();
    if (!ip) {
      throw new Error('L adresse IP est obligatoire.');
    }

    const ipv4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
    const ipv6 = /^[0-9a-fA-F:]+$/;
    if (!ipv4.test(ip) && !ipv6.test(ip)) {
      throw new Error('Le format de l adresse IP est invalide.');
    }

    super({ valeur: ip });
  }

  // Cette methode retourne l'adresse IP metier.
  public obtenirValeur(): string {
    return this.proprietes.valeur;
  }
}
