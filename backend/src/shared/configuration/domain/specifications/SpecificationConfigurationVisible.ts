import { NiveauConfiguration } from '../enums';
import { ConfigurationScope } from '../value-objects';

// Ce fichier declare la specification de visibilite d une configuration.

/** Cette classe indique si un niveau lecteur peut voir une portee donnee. */
export class SpecificationConfigurationVisible {
  /** Cette methode indique si une lecture est autorisee selon les niveaux. */
  public estSatisfaitePar(lecteur: NiveauConfiguration, scope: ConfigurationScope): boolean {
    const priorites: Record<NiveauConfiguration, number> = {
      SYSTEM: 0,
      ORGANIZATION: 1,
      SCHOOL: 2,
      USER: 3,
    };
    return priorites[lecteur] <= priorites[scope.niveau()];
  }
}
