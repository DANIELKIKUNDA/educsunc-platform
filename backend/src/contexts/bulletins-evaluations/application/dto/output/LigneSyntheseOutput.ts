import type { StatistiquesProclamationOutput } from './StatistiquesProclamationOutput';

// Ce DTO represente une ligne de synthese par classe.
export interface LigneSyntheseOutput {
  idClassePedagogique: string;
  libelleClasse: string;
  statistiques: StatistiquesProclamationOutput;
}
