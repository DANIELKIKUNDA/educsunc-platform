import { Eleve } from '../aggregates/Eleve';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier definit le contrat de lecture/ecriture des eleves pour le domaine.
export interface CritereRechercheIdentiteEleve {
  idEcole: UUID;
  nom: string;
  postNom: string;
  prenom?: string;
  dateNaissance?: string;
}

/**
 * Ce depot expose uniquement les besoins metier de l'agregat Eleve.
 */
export interface DepotEleve {
  /** Sauvegarde l'etat courant d'un eleve. */
  sauvegarder(eleve: Eleve): Promise<void>;
  /** Recherche un eleve par son identifiant permanent. */
  trouverParId(idEleve: UUID): Promise<Eleve | null>;
  /** Recherche un eleve par matricule dans une ecole. */
  trouverParMatricule(idEcole: UUID, matricule: string): Promise<Eleve | null>;
  /** Liste les eleves d'une ecole. */
  listerParEcole(idEcole: UUID): Promise<Eleve[]>;
  /** Liste les eleves d'une organisation. */
  listerParOrganisation(idOrganisation: UUID): Promise<Eleve[]>;
  /** Recherche des eleves par identite administrative. */
  rechercherParIdentite(critere: CritereRechercheIdentiteEleve): Promise<Eleve[]>;
  /** Indique si un matricule existe deja dans l'ecole. */
  existeMatriculeDansEcole(idEcole: UUID, matricule: string, idEleveIgnore?: UUID): Promise<boolean>;
  /** Indique si un doublon probable existe pour l'identite fournie. */
  existeDoublonProbable(critere: CritereRechercheIdentiteEleve, idEleveIgnore?: UUID): Promise<boolean>;
  /** Liste les eleves rattaches a une famille. */
  trouverParFamille(idFamille: UUID): Promise<Eleve[]>;
}
