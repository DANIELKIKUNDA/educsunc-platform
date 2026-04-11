import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { AnneeScolaire } from '../aggregates/AnneeScolaire';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { EcoleId } from '../value-objects/EcoleId';

// Ce depot definit le contrat de persistance des annees scolaires d'une ecole.
export interface DepotAnneeScolaire {
  // Cette methode recherche une annee scolaire par son identifiant metier.
  trouverParId(idAnneeScolaire: AnneeScolaireId): Promise<AnneeScolaire | null>;

  // Cette methode retrouve l'annee scolaire active d'une ecole si elle existe.
  trouverActiveParEcole(idEcole: EcoleId): Promise<AnneeScolaire | null>;

  // Cette methode liste les annees scolaires d'une ecole avec pagination.
  listerParEcole(
    idEcole: EcoleId,
    pagination: Pagination,
  ): Promise<ResultatPagine<AnneeScolaire>>;

  // Cette methode persiste l'etat courant d'une annee scolaire.
  sauvegarder(anneeScolaire: AnneeScolaire): Promise<void>;
}
