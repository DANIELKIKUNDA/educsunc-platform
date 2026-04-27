import { AffectationClasse } from '../aggregates/AffectationClasse';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit le contrat metier de persistance des affectations de classe.
/**
 * Ce depot expose les operations necessaires a l'agregat AffectationClasse.
 */
export interface DepotAffectationClasse {
  /** Sauvegarde l'etat courant d'une affectation. */
  sauvegarder(affectation: AffectationClasse): Promise<void>;
  /** Recherche une affectation par son identifiant. */
  trouverParId(idAffectationClasse: UUID): Promise<AffectationClasse | null>;
  /** Recherche l'affectation active d'une inscription. */
  trouverAffectationActiveParInscription(idInscriptionScolaire: UUID): Promise<AffectationClasse | null>;
  /** Liste les affectations actives d'une classe. */
  listerActivesParClasse(idClassePedagogique: UUID): Promise<AffectationClasse[]>;
  /** Liste les affectations actives d'une ecole. */
  listerActivesParEcole(idEcole: UUID): Promise<AffectationClasse[]>;
  /** Desactive l'affectation active d'une inscription si elle existe. */
  desactiverAffectationActiveParInscription(idInscriptionScolaire: UUID, modifiePar: UUID): Promise<void>;
}
