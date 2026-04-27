// Ce fichier definit le read model final des statistiques de scolarite calculees a la volee.
export type ScopeStatistiquesScolarite = 'ECOLE' | 'ORGANISATION';

// Cette interface represente une ligne agregee par classe dans les statistiques.
export interface StatistiquesClasseScolariteReadModel {
  classe: string;
  garcons: number;
  filles: number;
  total: number;
}

// Cette interface represente une ligne agregee par ecole pour une lecture organisationnelle.
export interface StatistiquesParEcoleScolariteReadModel {
  idEcole: string;
  totalEleves: number;
  totalAbandons: number;
}

// Cette interface expose les statistiques consolidees du BC Scolarite des Eleves.
export interface StatistiquesScolariteReadModel {
  scope: ScopeStatistiquesScolarite;
  organisation: {
    idOrganisation: string;
  };
  ecole?: {
    idEcole: string;
  };
  effectifs: {
    total: number;
    garcons: number;
    filles: number;
    parClasse: StatistiquesClasseScolariteReadModel[];
  };
  abandons: {
    total: number;
    garcons: number;
    filles: number;
    tauxAbandon: number;
    parClasse: StatistiquesClasseScolariteReadModel[];
  };
  participation: {
    inscrits: number;
    participants: number;
    tauxParticipation: number;
  };
  progression: {
    promus: number;
    redoublants: number;
  };
  parEcole?: StatistiquesParEcoleScolariteReadModel[];
}
