import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { OptionEtude } from '../aggregates/OptionEtude';
import { OptionEtudeId } from '../value-objects/OptionEtudeId';

// Ce depot definit le contrat de persistance des options d'etude officielles.
export interface DepotOptionEtude {
  // Cette methode recherche une option d'etude par son identifiant metier.
  trouverParId(idOptionEtude: OptionEtudeId): Promise<OptionEtude | null>;

  // Cette methode recherche une option d'etude par son code officiel.
  trouverParCode(code: number): Promise<OptionEtude | null>;

  // Cette methode liste les options d'etude actives du referentiel.
  listerActives(): Promise<OptionEtude[]>;

  // Cette methode retourne une lecture paginee des options d'etude.
  lister(pagination: Pagination): Promise<ResultatPagine<OptionEtude>>;

  // Cette methode persiste l'etat courant d'une option d'etude.
  sauvegarder(optionEtude: OptionEtude): Promise<void>;
}
