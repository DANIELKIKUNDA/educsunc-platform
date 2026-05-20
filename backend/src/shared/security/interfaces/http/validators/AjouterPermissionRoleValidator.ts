import type { AjouterPermissionRoleInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare l'ajout d'une permission a un role.
export class AjouterPermissionRoleValidator {
  public static valider(corps: unknown, codeRole?: string): AjouterPermissionRoleInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      codeRole: codeRole ?? ValidationHttpSecurity.lireChaineRequise(donnees, 'codeRole'),
      permission: ValidationHttpSecurity.lireChaineRequise(donnees, 'permission'),
      creePar: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'creePar'),
    };
  }
}
