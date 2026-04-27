import { EvenementParcours } from '../entities/EvenementParcours';
import { ParcoursScolaireEleve } from '../aggregates/ParcoursScolaireEleve';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit le contrat metier de persistance des parcours scolaires.
/**
 * Ce depot expose les operations necessaires a l'agregat ParcoursScolaireEleve.
 */
export interface DepotParcoursScolaireEleve {
  /** Sauvegarde l'etat courant d'un parcours scolaire. */
  sauvegarder(parcours: ParcoursScolaireEleve): Promise<void>;
  /** Recherche le parcours d'un eleve. */
  trouverParEleve(idEleve: UUID): Promise<ParcoursScolaireEleve | null>;
  /** Liste les evenements du parcours d'un eleve. */
  listerEvenementsParEleve(idEleve: UUID): Promise<EvenementParcours[]>;
  /** Liste les evenements de parcours d'une annee scolaire. */
  listerEvenementsParAnnee(idAnneeScolaire: UUID): Promise<EvenementParcours[]>;
  /** Liste les evenements de parcours d'une ecole. */
  listerEvenementsParEcole(idEcole: UUID): Promise<EvenementParcours[]>;
  /** Liste les evenements de parcours d'une organisation. */
  listerEvenementsParOrganisation(idOrganisation: UUID): Promise<EvenementParcours[]>;
}
