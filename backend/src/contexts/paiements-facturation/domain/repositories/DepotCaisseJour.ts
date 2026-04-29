import { CaisseJour } from '../aggregates/CaisseJour';

export interface DepotCaisseJour {
  sauvegarder(caisseJour: CaisseJour): Promise<void>;
  trouverParId(idCaisseJour: string): Promise<CaisseJour | null>;
  trouverActiveParEcoleEtDate(idEcole: string, dateCaisse: string): Promise<CaisseJour | null>;
}
