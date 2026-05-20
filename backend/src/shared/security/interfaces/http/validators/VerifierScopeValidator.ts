import type { VerifierScopeInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare une verification de scope SECURITY.
export class VerifierScopeValidator {
  public static valider(corps: unknown): VerifierScopeInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      idOrganisation: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idOrganisation'),
      idEcole: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idEcole'),
    };
  }
}
