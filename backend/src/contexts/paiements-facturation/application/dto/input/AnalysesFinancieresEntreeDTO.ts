export interface ConsulterPaiementsParCaissierInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ConsulterPaiementsParTypeFraisInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ConsulterFondsAnticipesInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ConsulterRegistreFinancierClasseInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
}

export interface ConsulterSyntheseFinanciereClasseInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idAnneeScolaire: string;
  idClassePedagogique: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
}

export interface ConsulterSyntheseFinanciereSectionInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idAnneeScolaire: string;
  idSectionScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
}

export interface ConsulterSyntheseFinanciereEcoleInput {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
}

export interface ConsulterSyntheseFinanciereOrganisationInput {
  idOrganisation: string;
  idUtilisateur: string;
  idAnneeScolaire: string;
  moisAnalyseJusqua?: string;
  typeFrais?: string;
}
