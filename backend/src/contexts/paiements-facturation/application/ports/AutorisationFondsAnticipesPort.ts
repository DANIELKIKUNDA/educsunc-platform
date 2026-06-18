export interface ResultatAutorisationFondsAnticipes {
  idsElevesAutorises?: readonly string[];
}

export interface AutorisationFondsAnticipesPort {
  resoudreConsultationFondsAnticipes(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
  }): Promise<ResultatAutorisationFondsAnticipes>;
}
