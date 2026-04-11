import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { SectionScolaire } from '../aggregates/SectionScolaire';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';

// Ce depot definit le contrat de persistance des sections scolaires du referentiel global.
export interface DepotSectionScolaire {
  // Cette methode recherche une section scolaire par son identifiant metier.
  trouverParId(idSectionScolaire: SectionScolaireId): Promise<SectionScolaire | null>;

  // Cette methode recherche une section scolaire par son code.
  trouverParCode(code: string): Promise<SectionScolaire | null>;

  // Cette methode liste les sections scolaires actives du referentiel.
  listerActives(): Promise<SectionScolaire[]>;

  // Cette methode retourne une lecture paginee des sections scolaires.
  lister(pagination: Pagination): Promise<ResultatPagine<SectionScolaire>>;

  // Cette methode persiste l'etat courant d'une section scolaire.
  sauvegarder(sectionScolaire: SectionScolaire): Promise<void>;
}
