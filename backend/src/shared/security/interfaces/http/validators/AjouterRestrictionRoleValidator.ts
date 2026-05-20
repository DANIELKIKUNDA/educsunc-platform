import type { AjouterRestrictionRoleInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare l'ajout d'une restriction metier a un role.
export class AjouterRestrictionRoleValidator {
  public static valider(corps: unknown, codeRole?: string): AjouterRestrictionRoleInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      codeRole: codeRole ?? ValidationHttpSecurity.lireChaineRequise(donnees, 'codeRole'),
      codeRestriction: ValidationHttpSecurity.lireChaineRequise(donnees, 'codeRestriction'),
      description: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'description'),
    };
  }
}
