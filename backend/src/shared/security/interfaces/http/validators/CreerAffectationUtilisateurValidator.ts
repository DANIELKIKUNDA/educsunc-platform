import type { CreerAffectationUtilisateurInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur controle la creation d'une affectation utilisateur SECURITY.
export class CreerAffectationUtilisateurValidator {
  public static valider(corps: unknown): CreerAffectationUtilisateurInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idUtilisateur: ValidationHttpSecurity.lireChaineRequise(donnees, 'idUtilisateur'),
      idRole: ValidationHttpSecurity.lireChaineRequise(donnees, 'idRole'),
      niveauAcces: ValidationHttpSecurity.lireChaineRequise(donnees, 'niveauAcces'),
      idOrganisation: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idOrganisation'),
      idEcole: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idEcole'),
      idSection: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idSection'),
      idClasse: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idClasse'),
      idCours: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'idCours'),
      creePar: ValidationHttpSecurity.lireChaineOptionnelle(donnees, 'creePar'),
    };
  }
}
