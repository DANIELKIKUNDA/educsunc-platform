import { Pagination, ResultatPagine } from '../../../../shared/application/Pagination';
import { ClassePedagogique } from '../aggregates/ClassePedagogique';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../value-objects/ClassePedagogiqueId';
import { EcoleId } from '../value-objects/EcoleId';

// Ce depot definit le contrat de persistance des classes pedagogiques locales.
export interface DepotClassePedagogique {
  // Cette methode recherche une classe pedagogique par son identifiant metier.
  trouverParId(idClassePedagogique: ClassePedagogiqueId): Promise<ClassePedagogique | null>;

  // Cette methode recherche une classe pedagogique par son code dans le contexte d'une ecole et d'une annee.
  trouverParCodeDansContexte(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    code: string,
  ): Promise<ClassePedagogique | null>;

  // Cette methode liste les classes pedagogiques d'une ecole pour une annee donnee.
  listerParEcoleEtAnnee(
    idEcole: EcoleId,
    idAnneeScolaire: AnneeScolaireId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ClassePedagogique>>;

  // Cette methode persiste l'etat courant d'une classe pedagogique.
  sauvegarder(classePedagogique: ClassePedagogique): Promise<void>;
}
