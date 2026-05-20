// Cet enum represente les etats metier possibles d'un compte utilisateur.
export enum EtatCompteUtilisateur {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DISABLED = 'DISABLED',
}

// Cette fonction normalise un etat de compte vers une valeur metier officielle.
export function normaliserEtatCompteUtilisateur(valeur: string | EtatCompteUtilisateur): EtatCompteUtilisateur {
  const etat = String(valeur || '').trim().toUpperCase();
  return (Object.values(EtatCompteUtilisateur) as string[]).includes(etat)
    ? (etat as EtatCompteUtilisateur)
    : EtatCompteUtilisateur.ACTIVE;
}
