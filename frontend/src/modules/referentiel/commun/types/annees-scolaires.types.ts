export type StatutAnneeScolaire = 'PLANIFIEE' | 'ACTIVE' | 'CLOTUREE' | 'ARCHIVEE';

export interface AnneeScolaireResume {
  id: string;
  libelle: string;
  statut: StatutAnneeScolaire;
  dateDebut: string;
  dateFin: string;
}
