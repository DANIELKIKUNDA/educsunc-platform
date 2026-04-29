import { ParametresPaiementEcole } from '../aggregates/ParametresPaiementEcole';

export interface DepotParametresPaiementEcole {
  sauvegarder(parametres: ParametresPaiementEcole): Promise<void>;
  trouverParId(idParametresPaiementEcole: string): Promise<ParametresPaiementEcole | null>;
  trouverActifParEcole(idEcole: string): Promise<ParametresPaiementEcole | null>;
}
