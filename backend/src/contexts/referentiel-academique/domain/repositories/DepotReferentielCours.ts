import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { ReferentielCours } from '../aggregates/ReferentielCours';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';

// Ce depot definit le contrat de persistance du catalogue officiel des cours.
export interface DepotReferentielCours {
  // Cette methode recherche un cours officiel par son identifiant metier.
  trouverParId(idReferentielCours: ReferentielCoursId): Promise<ReferentielCours | null>;

  // Cette methode recherche un cours officiel par son code stable.
  trouverParCode(code: string): Promise<ReferentielCours | null>;

  // Cette methode retourne une lecture paginee des cours officiels.
  lister(pagination: Pagination): Promise<ResultatPagine<ReferentielCours>>;

  // Cette methode persiste l'etat courant d'un cours officiel.
  sauvegarder(referentielCours: ReferentielCours): Promise<void>;
}
