export interface ElevePaiementDTO {
  idEleve: string;
  idEcole: string;
  idOrganisation: string;
}

export interface InscriptionPaiementDTO {
  idInscriptionScolaire: string;
  idEleve: string;
  idEcole: string;
  idAnneeScolaire: string;
}

export interface ClasseEleveDTO {
  idClassePedagogique: string;
  idEcole: string;
  idAnneeScolaire: string;
}

export interface FamillePaiementDTO {
  idFamille: string;
  idEcole: string;
  nombreEnfants?: number;
  responsables?: Array<{
    idResponsableFamille: string;
    idUtilisateurAuth?: string;
    estPrincipal: boolean;
  }>;
}

export interface StatutScolaireDTO {
  idEleve: string;
  statut: string;
  actif: boolean;
}

export interface ScolariteElevesPort {
  consulterEleve(idEleve: string): Promise<ElevePaiementDTO>;
  consulterInscriptionActive(idEleve: string): Promise<InscriptionPaiementDTO | null>;
  consulterClasseActiveEleve(idEleve: string): Promise<ClasseEleveDTO | null>;
  consulterFamilleEleve(idEleve: string): Promise<FamillePaiementDTO | null>;
  verifierStatutScolaire(idEleve: string): Promise<StatutScolaireDTO>;
}
