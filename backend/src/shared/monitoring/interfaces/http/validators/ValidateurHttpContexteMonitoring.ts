import type { DtoHttpMonitoringContext } from '../dto/inputs';
import { objetRequis, texteOptionnel } from './_validation-support';

export class ValidateurHttpContexteMonitoring {
  public static valider(entree: unknown): DtoHttpMonitoringContext {
    const objet = objetRequis(entree ?? {}, 'contexte');
    return {
      organisationId: texteOptionnel(objet, 'organisationId', 160),
      ecoleId: texteOptionnel(objet, 'ecoleId', 160),
      utilisateurId: texteOptionnel(objet, 'utilisateurId', 160),
      module: texteOptionnel(objet, 'module', 120),
      composant: texteOptionnel(objet, 'composant', 120),
      correlationId: texteOptionnel(objet, 'correlationId', 128),
    };
  }
}
