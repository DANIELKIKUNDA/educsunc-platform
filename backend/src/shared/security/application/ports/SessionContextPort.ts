export interface SessionContextPort {
  obtenirUtilisateurAuthentifie(): Promise<{
    idUtilisateur: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
  } | null>;
}
