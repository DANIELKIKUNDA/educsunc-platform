import { NIVEAUX_SANTE_SYSTEME } from '../../../domain';
import type { DtoHttpOpenIncident } from '../dto/inputs';
import { objetRequis, texteRequis, valeurEnumRequise } from './_validation-support';
import { ValidateurHttpContexteMonitoring } from './ValidateurHttpContexteMonitoring';

export class ValidateurHttpOpenIncident {
  public static valider(entree: unknown): DtoHttpOpenIncident {
    const objet = objetRequis(entree, 'incident');
    return {
      incidentId: texteRequis(objet, 'incidentId', 160),
      resume: texteRequis(objet, 'resume', 1000),
      niveau: valeurEnumRequise(objet, 'niveau', NIVEAUX_SANTE_SYSTEME),
      contexte: ValidateurHttpContexteMonitoring.valider(objet.contexte),
      correlationId: texteRequis(objet, 'correlationId', 128),
    };
  }
}
