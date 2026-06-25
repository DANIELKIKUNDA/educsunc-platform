export type ExonerationActorCode =
  | 'ADMINISTRATEUR_ECOLE'
  | 'GESTIONNAIRE_ORGANISATION'
  | 'PROMOTEUR_ORGANISATION'
  | 'SECRETAIRE';

export interface ExonerationDecisionLog {
  id: string;
  date: string;
  action: 'ACCORDEE' | 'ANNULEE';
  montant: number;
  motif: string;
  acteur: string;
  statut: 'VALIDE' | 'ANNULEE';
}

export interface ExonerationTargetObligation {
  id: string;
  eleveNom: string;
  matricule: string;
  classe: string;
  typeFrais: string;
  libelle: string;
  montantInitial: number;
  montantExonere: number;
  soldeRestant: number;
  dejaExoneree: boolean;
  logs: ExonerationDecisionLog[];
}

export const authorizedExonerationActors: ExonerationActorCode[] = [
  'ADMINISTRATEUR_ECOLE',
  'GESTIONNAIRE_ORGANISATION',
  'PROMOTEUR_ORGANISATION',
  'SECRETAIRE',
];

export const exonerationTargetObligation: ExonerationTargetObligation = {
  id: 'obl-exo-001',
  eleveNom: 'Mukuta Musenge Josias',
  matricule: 'ELV-000381',
  classe: '4e H - ELEC',
  typeFrais: 'Frais techniques',
  libelle: 'Atelier technique - Juin',
  montantInitial: 45000,
  montantExonere: 10000,
  soldeRestant: 35000,
  dejaExoneree: true,
  logs: [
    {
      id: 'exo-log-1',
      date: '14/06/2026 10:22',
      action: 'ACCORDEE',
      montant: 10000,
      motif: 'Ajustement social autorise',
      acteur: 'Bemba Kalombo',
      statut: 'VALIDE',
    },
    {
      id: 'exo-log-2',
      date: '16/06/2026 08:05',
      action: 'ANNULEE',
      montant: 5000,
      motif: 'Correction de decision partielle',
      acteur: 'Bemba Kalombo',
      statut: 'ANNULEE',
    },
  ],
};
