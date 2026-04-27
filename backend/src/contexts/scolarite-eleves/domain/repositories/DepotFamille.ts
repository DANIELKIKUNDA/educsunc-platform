import { Famille } from '../aggregates/Famille';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit le contrat metier de persistance des familles.
/**
 * Ce depot expose les operations necessaires a l'agregat Famille.
 */
export interface DepotFamille {
  /** Sauvegarde l'etat courant d'une famille. */
  sauvegarder(famille: Famille): Promise<void>;
  /** Recherche une famille par son identifiant. */
  trouverParId(idFamille: UUID): Promise<Famille | null>;
  /** Recherche une famille par code dans une ecole. */
  trouverParCode(idEcole: UUID, codeFamille: string): Promise<Famille | null>;
  /** Liste les familles d'une ecole. */
  listerParEcole(idEcole: UUID): Promise<Famille[]>;
  /** Liste les familles d'une organisation. */
  listerParOrganisation(idOrganisation: UUID): Promise<Famille[]>;
  /** Indique si un code famille existe deja dans l'ecole. */
  existeCodeFamilleDansEcole(idEcole: UUID, codeFamille: string, idFamilleIgnore?: UUID): Promise<boolean>;
  /** Compte les eleves actifs rattaches a la famille pour l'eligibilite famille nombreuse. */
  compterElevesActifsDeFamille(idFamille: UUID): Promise<number>;
}
