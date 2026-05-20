// Ce port encapsule le hash et la verification du mot de passe.
export interface PasswordHashPort {
  hacherMotDePasse(motDePasseClair: string): Promise<string>;
  verifierMotDePasse(motDePasseClair: string, motDePasseHash: string): Promise<boolean>;
}
