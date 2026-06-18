// Ce fichier decrit le perimetre metier exploitable pour securiser une mutation de statut eleve.
export interface ResolutionPerimetreCycleVieEleve {
  idOrganisation: string;
  idEcole: string;
  idInscriptionScolaire?: string;
  idAnneeScolaire?: string;
  idClassePedagogique?: string;
  idSectionScolaire?: string;
  sectionCode?: string;
  sectionLibelle?: string;
}
