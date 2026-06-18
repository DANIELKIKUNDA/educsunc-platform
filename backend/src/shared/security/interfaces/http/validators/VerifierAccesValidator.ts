import type { VerifierAccesInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur prepare une verification d'acces composee.
export class VerifierAccesValidator {
  public static valider(corps: unknown): VerifierAccesInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      permissionDemandee: ValidationHttpSecurity.lireChaineRequise(donnees, 'permissionDemandee'),
      idOrganisation: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idOrganisation'),
      idEcole: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idEcole'),
      idSection: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idSection'),
      idClasse: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idClasse'),
      idAnneeScolaire: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idAnneeScolaire'),
      codeRestriction: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'codeRestriction'),
    };
  }
}
