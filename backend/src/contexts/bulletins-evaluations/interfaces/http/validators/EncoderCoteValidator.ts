import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import type { EncoderCoteInput } from 'contexts/bulletins-evaluations/application/dto/input/EncoderCoteInput';
import { ValidationHttpBulletinsEvaluations } from './ValidationHttpBulletinsEvaluations';

// Ce validateur controle la commande HTTP d'encodage initial d'une cote.
export class EncoderCoteValidator {
  // Cette methode transforme le corps et les headers HTTP en input applicatif valide.
  public static valider(corps: unknown, headers: unknown): EncoderCoteInput {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(corps, 'body');

    return {
      idFicheCotationEleveCours: ValidationHttpBulletinsEvaluations.lireChaineRequise(
        donnees,
        'idFicheCotationEleveCours',
      ),
      codeColonne: ValidationHttpBulletinsEvaluations.lireEnumRequis(donnees, 'codeColonne', CodeColonneBulletin),
      cote: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'cote'),
      versionAttendue: ValidationHttpBulletinsEvaluations.lireEntierRequis(donnees, 'versionAttendue'),
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-user-id') ?? 'SYSTEME',
      cleIdempotence: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-idempotency-key'),
      origineSynchronisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-sync-origin') as
        | 'ONLINE'
        | 'OFFLINE'
        | undefined,
    };
  }
}
