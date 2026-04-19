export type StatutAnneeScolaire = 'PLANIFIEE' | 'ACTIVE' | 'CLOTUREE' | 'ARCHIVEE';

export interface AnneeScolaireResume {
  id: string;
  idEcole: string;
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutAnneeScolaire;
  active: boolean;
  creeLe: string;
  version: number;
  creePar?: string;
  dateActivation?: string;
  dateCloture?: string;
  dateArchivage?: string;
  modifieLe?: string;
  modifiePar?: string;
}

export interface PaginationAnneesScolaires {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

export interface ReponseListeAnneesScolaires {
  donnees: AnneeScolaireResume[];
  pagination: PaginationAnneesScolaires;
}

export interface ReponseAnneeScolaireOptionnelle {
  donnee: AnneeScolaireResume | null;
}

export interface ReponseAnneeScolaire {
  donnee: AnneeScolaireResume;
}

export type ActionGarantieAnneeActive =
  | 'EXISTANTE'
  | 'CREEE_ET_ACTIVEE'
  | 'PLANIFIEE_ACTIVEE';

export interface ReponseGarantieAnneeActive {
  donnee: AnneeScolaireResume;
  meta: {
    action: ActionGarantieAnneeActive;
  };
}

export interface ReponsePreparationAnneeScolaire {
  donnee: AnneeScolaireResume;
  meta: {
    dejaExistante: boolean;
  };
}

export interface ReponseBasculeAnneeScolaire {
  donnee: {
    anneeCloturee: AnneeScolaireResume;
    anneeActive: AnneeScolaireResume;
  };
  meta: {
    anneeSuivanteCreee: boolean;
  };
}
