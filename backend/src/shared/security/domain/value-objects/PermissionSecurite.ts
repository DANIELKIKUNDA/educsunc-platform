import { ObjetValeur } from '../../../domain/ValueObject';

export const PERMISSIONS_SECURITE = [
  'referentiel.read',
  'referentiel.write',
  'annees.read',
  'annees.write',
  'eleves.read',
  'eleves.write',
  'abandons.write',
  'transferts.write',
  'paiements.read',
  'paiements.write',
  'caisse.read',
  'caisse.write',
  'cotes.read',
  'cotes.write',
  'bulletins.read',
  'bulletins.generate',
  'proclamations.read',
  'proclamations.generate',
  'notifications.send',
  'sms.send',
  'convocations.send',
  'utilisateurs.read',
  'utilisateurs.write',
  'roles.read',
  'roles.write',
  'permissions.read',
  'permissions.write',
] as const;

export type PermissionSecuriteValeur = (typeof PERMISSIONS_SECURITE)[number];

// Cet objet valeur represente une permission officielle du module SECURITY.
export class PermissionSecurite extends ObjetValeur<{ valeur: PermissionSecuriteValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as PermissionSecuriteValeur;
    if (!PERMISSIONS_SECURITE.includes(valeurNormalisee)) {
      throw new Error('La permission de securite est invalide.');
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): PermissionSecuriteValeur {
    return this.proprietes.valeur;
  }
}
