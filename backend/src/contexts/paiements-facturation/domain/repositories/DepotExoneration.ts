import { Exoneration } from '../aggregates/Exoneration';

export interface DepotExoneration {
  sauvegarder(exoneration: Exoneration): Promise<void>;
  trouverParId(idExoneration: string): Promise<Exoneration | null>;
  listerParEleve(idEcole: string, idEleve: string): Promise<Exoneration[]>;
}
