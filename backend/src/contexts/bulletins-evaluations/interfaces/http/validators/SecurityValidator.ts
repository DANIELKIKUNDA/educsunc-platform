import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur lit le contexte de securite HTTP sans y mettre de logique metier profonde.
export class SecurityValidator {
  // Cette methode normalise les informations de securite portees par les headers.
  public static valider(headers: unknown): {
    idUtilisateur?: string;
    role?: string;
    scope?: string;
  } {
    return {
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id'),
      role: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-role'),
      scope: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-scope'),
    };
  }
}
