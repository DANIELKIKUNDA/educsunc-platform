import { ResponsabiliteClassePedagogique } from '../aggregates/ResponsabiliteClassePedagogique';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClassePedagogiqueId } from '../value-objects/ClassePedagogiqueId';

// Ce depot definit le contrat de persistance des responsabilites de classes pedagogiques.
export interface DepotResponsabiliteClassePedagogique {
  trouverActiveParClasseEtAnnee(
    idClassePedagogique: ClassePedagogiqueId,
    idAnneeScolaire: AnneeScolaireId,
  ): Promise<ResponsabiliteClassePedagogique | null>;

  sauvegarder(responsabiliteClassePedagogique: ResponsabiliteClassePedagogique): Promise<void>;
}
