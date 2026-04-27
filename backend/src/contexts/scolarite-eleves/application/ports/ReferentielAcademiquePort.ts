// Ce fichier definit le port applicatif vers le BC Referentiel Academique.
export interface InformationsClassePedagogique {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
  archivee: boolean;
}

/**
 * Ce port permet de verifier les organisations, ecoles, annees et classes sans dependance directe.
 */
export interface ReferentielAcademiquePort {
  verifierOrganisationExiste(idOrganisation: string): Promise<boolean>;
  verifierEcoleAppartientOrganisation(idOrganisation: string, idEcole: string): Promise<boolean>;
  verifierAnneeScolaireValide(idEcole: string, idAnneeScolaire: string): Promise<boolean>;
  obtenirClassePedagogique(idClassePedagogique: string): Promise<InformationsClassePedagogique | null>;
}
