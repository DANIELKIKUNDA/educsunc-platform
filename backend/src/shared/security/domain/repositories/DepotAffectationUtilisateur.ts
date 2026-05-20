import { AffectationUtilisateur } from '../aggregates/AffectationUtilisateur';

export interface DepotAffectationUtilisateur {
  sauvegarder(affectationUtilisateur: AffectationUtilisateur): Promise<void>;
  listerActivesParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]>;
}
