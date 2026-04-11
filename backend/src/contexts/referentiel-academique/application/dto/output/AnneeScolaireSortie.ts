import { StatutAnneeScolaire } from '../../../domain/value-objects/StatutAnneeScolaire';

// Ce DTO represente la forme de sortie standard d'une annee scolaire cote application.
export interface AnneeScolaireSortie {
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
