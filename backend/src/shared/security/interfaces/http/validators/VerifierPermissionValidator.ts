import type { VerifierPermissionInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare une verification de permission SECURITY.
export class VerifierPermissionValidator {
  public static valider(corps: unknown): VerifierPermissionInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      permissionDemandee: ValidationHttpSecurity.lireChaineRequise(donnees, 'permissionDemandee'),
    };
  }
}
