import type { AppliquerMigrationBulletinInput } from 'contexts/bulletins-evaluations/application/dto/input/AppliquerMigrationBulletinInput';
import type { GenererMigrationBulletinInput } from 'contexts/bulletins-evaluations/application/dto/input/GenererMigrationBulletinInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle les commandes HTTP liees aux migrations de bulletin.
export class MigrationBulletinValidator {
  // Cette methode valide une demande d'analyse de migration.
  public static validerAnalyse(corps: unknown, headers: unknown): GenererMigrationBulletinInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idClassePedagogique: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      ancienneVersionReferentiel: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'ancienneVersionReferentiel',
      ),
      nouvelleVersionReferentiel: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'nouvelleVersionReferentiel',
      ),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id') ?? 'SYSTEME',
    };
  }

  // Cette methode valide une demande d'application de migration.
  public static validerApplication(corps: unknown, headers: unknown): AppliquerMigrationBulletinInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idMigrationBulletin: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idMigrationBulletin'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id') ?? 'SYSTEME',
    };
  }
}
