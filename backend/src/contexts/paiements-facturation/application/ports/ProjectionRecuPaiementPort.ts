export interface ProjectionEleveRecuDTO {
  idEleve: string;
  code: string;
  nom: string;
  postnom: string;
  prenom?: string;
  sexe: string;
}

export interface ProjectionEcoleRecuDTO {
  idEcole: string;
  nom: string;
  sigle?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  logoUrl?: string;
  cachetUrl?: string;
}

export interface ProjectionContexteScolaireRecuDTO {
  anneeScolaire?: string;
  classe?: string;
}

export interface ProjectionCaissierRecuDTO {
  idUtilisateur: string;
  nomComplet: string;
  signatureUrl?: string;
}

export interface ProjectionRecuPaiementPort {
  consulterEleve(idEleve: string): Promise<ProjectionEleveRecuDTO>;
  consulterEcole(idEcole: string): Promise<ProjectionEcoleRecuDTO>;
  consulterContexteScolaire(idEleve: string): Promise<ProjectionContexteScolaireRecuDTO>;
  consulterCaissier(idUtilisateur: string): Promise<ProjectionCaissierRecuDTO>;
}
