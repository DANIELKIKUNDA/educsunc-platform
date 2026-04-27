import { InscriptionScolaire } from '../aggregates/InscriptionScolaire';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit le contrat metier de persistance des inscriptions annuelles.
/**
 * Ce depot expose les operations necessaires a l'agregat InscriptionScolaire.
 */
export interface DepotInscriptionScolaire {
  /** Sauvegarde l'etat courant d'une inscription. */
  sauvegarder(inscription: InscriptionScolaire): Promise<void>;
  /** Recherche une inscription par son identifiant. */
  trouverParId(idInscriptionScolaire: UUID): Promise<InscriptionScolaire | null>;
  /** Recherche l'inscription active d'un eleve pour une annee scolaire. */
  trouverInscriptionActiveParEleveEtAnnee(idEleve: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire | null>;
  /** Liste les inscriptions d'une annee scolaire. */
  listerParAnnee(idAnneeScolaire: UUID): Promise<InscriptionScolaire[]>;
  /** Liste les inscriptions rattachees a une classe pedagogique. */
  listerParClasse(idClassePedagogique: UUID): Promise<InscriptionScolaire[]>;
  /** Liste les inscriptions d'une ecole pour une annee scolaire. */
  listerParEcoleEtAnnee(idEcole: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire[]>;
  /** Liste les inscriptions d'une organisation pour une annee scolaire. */
  listerParOrganisationEtAnnee(idOrganisation: UUID, idAnneeScolaire: UUID): Promise<InscriptionScolaire[]>;
  /** Indique si une inscription active existe deja pour l'eleve et l'annee. */
  existeInscriptionActiveParEleveEtAnnee(idEleve: UUID, idAnneeScolaire: UUID): Promise<boolean>;
}
