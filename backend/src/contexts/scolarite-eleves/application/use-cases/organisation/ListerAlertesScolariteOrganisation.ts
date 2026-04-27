import { UseCase } from '../../../../../shared/application/UseCase';

// Ce fichier contient le cas d'usage de liste des alertes de scolarite organisationnelle.
export interface AlerteScolariteOrganisationSortie {
  niveau: 'INFO' | 'AVERTISSEMENT' | 'CRITIQUE';
  message: string;
  referenceMetier?: string;
}
export interface ListerAlertesScolariteOrganisationEntree { idOrganisation: string }

/** Ce cas d'usage prepare les alertes organisationnelles sans charger les agregats complets. */
export class ListerAlertesScolariteOrganisation implements UseCase<ListerAlertesScolariteOrganisationEntree, AlerteScolariteOrganisationSortie[]> {
  /** Execute la liste des alertes. */
  public async executer(_entree: ListerAlertesScolariteOrganisationEntree): Promise<AlerteScolariteOrganisationSortie[]> {
    return [];
  }
}
