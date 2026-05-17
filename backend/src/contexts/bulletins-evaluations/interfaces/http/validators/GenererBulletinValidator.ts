import type { GenererBulletinEleveInput } from 'contexts/bulletins-evaluations/application/dto/input/GenererBulletinEleveInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP de generation d'un bulletin eleve.
export class GenererBulletinValidator {
  // Cette methode transforme la requete HTTP en input applicatif propre a la generation de bulletin.
  public static valider(corps: unknown, headers: unknown): GenererBulletinEleveInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idEleve: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idEleve'),
      idInscriptionScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idInscriptionScolaire'),
      idAnneeScolaire: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
      typeGeneration: ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'typeGeneration') as never,
      versionBulletin: ValidationHttpBulletinsEvaluations.lireValeur(donnees, 'versionBulletin') as number | undefined,
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id') ?? 'SYSTEME',
      preparerPdf: ValidationHttpBulletinsEvaluations.lireBooleenOptionnel(donnees, 'preparerPdf'),
    };
  }
}
