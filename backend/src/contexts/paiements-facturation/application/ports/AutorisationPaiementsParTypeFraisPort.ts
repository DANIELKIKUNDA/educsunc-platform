export interface ResultatAutorisationPaiementsParTypeFrais {
  idsElevesAutorises?: readonly string[];
}

export interface AutorisationPaiementsParTypeFraisPort {
  resoudreConsultationPaiementsParTypeFrais(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<ResultatAutorisationPaiementsParTypeFrais>;
}
