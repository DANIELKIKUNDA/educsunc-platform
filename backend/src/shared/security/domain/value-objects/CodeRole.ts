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
  'CAISSIER',
  'COMPTABLE',
  'PARENT',
] as const;

export type CodeRoleValeur = (typeof CODES_ROLE_SECURITE)[number];

// Cet objet valeur porte un code role officiel de la gouvernance SECURITY.
export class CodeRole extends ObjetValeur<{ valeur: CodeRoleValeur }> {
  constructor(valeur: string) {
    const valeurNormalisee = String(valeur || '').trim() as CodeRoleValeur;
    if (!CODES_ROLE_SECURITE.includes(valeurNormalisee)) {
      throw new Error('Le code role est invalide.');
    }

    super({ valeur: valeurNormalisee });
  }

  public obtenirValeur(): CodeRoleValeur {
    return this.proprietes.valeur;
  }
}
