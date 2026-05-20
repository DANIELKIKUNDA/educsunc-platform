import type { AjouterScopeAffectationInput } from 'shared/security/application';
import { ValidationHttpSecurity } from './ValidationHttpSecurity';

// Ce validateur controle l'ajout d'un scope a une affectation.
export class AjouterScopeAffectationValidator {
  public static valider(corps: unknown, idAffectationUtilisateur?: string): AjouterScopeAffectationInput {
    const donnees = ValidationHttpSecurity.obtenirObjet(corps, 'body');
    return {
      idAffectationUtilisateur: idAffectationUtilisateur ?? ValidationHttpSecurity.lireChaineRequise(donnees, 'idAffectationUtilisateur'),
      typeScope: ValidationHttpSecurity.lireChaineRequise(donnees, 'typeScope'),
      valeurScope: ValidationHttpSecurity.lireChaineRequise(donnees, 'valeurScope'),
      estLectureSeule: ValidationHttpSecurity.lireBooleenOptionnel(donnees, 'estLectureSeule'),
    };
  }
}
