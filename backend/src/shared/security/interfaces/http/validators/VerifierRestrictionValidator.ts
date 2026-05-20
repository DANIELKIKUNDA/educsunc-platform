import type { VerifierRestrictionInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare une verification de restriction metier.
export class VerifierRestrictionValidator {
  public static valider(corps: unknown): VerifierRestrictionInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      codeRestriction: ValidationHttpSecurity.lireChaineRequise(donnees, 'codeRestriction'),
    };
  }
}
