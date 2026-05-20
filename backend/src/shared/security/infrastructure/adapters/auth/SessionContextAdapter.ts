import type { SessionContextPort } from '../../../application';

type ChargeurSessionAuthentifiee = () => Promise<{
  idUtilisateur: string;
  organisationActiveId?: string;
  ecoleActiveId?: string;
} | null>;

// Cet adaptateur expose a SECURITY le contexte de session actuellement etabli par AUTH.
export class SessionContextAdapter implements SessionContextPort {
  constructor(private readonly chargeurSessionAuthentifiee: ChargeurSessionAuthentifiee) {}

  public async obtenirUtilisateurAuthentifie(): Promise<{
    idUtilisateur: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  } | null> {
    return this.chargeurSessionAuthentifiee();
  }
}
