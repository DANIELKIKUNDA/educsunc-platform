import { ObjetValeur } from '../../../domain/ValueObject';

export const CODES_ROLE_SECURITE = [
  'MANAGER_SYSTEME',
  'OPERATEUR_SYSTEME',
  'SUPPORT_SYSTEME',
  'PROMOTEUR_ORGANISATION',
  'ADMIN_SYSTEME_ORGANISATION',
  'GESTIONNAIRE_ORGANISATION',
  'ADMINISTRATEUR_ECOLE',
  'ADMIN_SYSTEME_ECOLE',
  'PREFET_ETUDES',
  'DIRECTEUR_ETUDES',
  'DIRECTEUR_DISCIPLINE',
  'DIRECTEUR_PRIMAIRE',
  'DIRECTEUR_MATERNELLE',
  'ENSEIGNANT',
  'SECRETAIRE',
  'CAISSIER',
  'COMPTABLE',
  'PARENT',
] as const;

export type CodeRoleSystemeValeur = (typeof CODES_ROLE_SECURITE)[number];
export type CodeRoleValeur = CodeRoleSystemeValeur | `CUSTOM_${string}`;

// Cet objet valeur porte un code role officiel de la gouvernance SECURITY.
export class CodeRole extends ObjetValeur<{ valeur: CodeRoleValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim().toUpperCase() as CodeRoleValeur;
    const estRoleSysteme = CODES_ROLE_SECURITE.includes(valeurNormalisee as CodeRoleSystemeValeur);
    const estRolePersonnalise = /^CUSTOM_[A-Z0-9][A-Z0-9_]{2,59}$/.test(valeurNormalisee);
    if (!estRoleSysteme && !estRolePersonnalise) {
      throw new Error('Le code role est invalide.');
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): CodeRoleValeur {
    return this.proprietes.valeur;
  }

  public estSystemeOfficiel(): boolean {
    return CODES_ROLE_SECURITE.includes(this.proprietes.valeur as CodeRoleSystemeValeur);
  }
}
