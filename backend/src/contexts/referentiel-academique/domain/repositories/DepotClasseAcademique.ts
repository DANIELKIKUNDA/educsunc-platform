import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { ClasseAcademique } from '../aggregates/ClasseAcademique';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';

// Ce depot definit le contrat de persistance des classes academiques officielles.
export interface DepotClasseAcademique {
  // Cette methode recherche une classe academique par son identifiant metier.
  trouverParId(idClasseAcademique: ClasseAcademiqueId): Promise<ClasseAcademique | null>;

  // Cette methode recherche une classe academique par son code.
  trouverParCode(code: string): Promise<ClasseAcademique | null>;

  // Cette methode liste les classes academiques d'une section scolaire.
  listerParSection(
    idSectionScolaire: SectionScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ClasseAcademique>>;

  // Cette methode retourne une lecture paginee des classes academiques.
  lister(pagination: Pagination): Promise<ResultatPagine<ClasseAcademique>>;

  // Cette methode persiste l'etat courant d'une classe academique.
  sauvegarder(classeAcademique: ClasseAcademique): Promise<void>;
}
