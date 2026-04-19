export interface ContexteEcoleCourant {
  idEcole: string | null;
  tenantId: string | null;
  idUtilisateur: string | null;
  nomOrganisation: string;
  nomEcole: string;
}

function lireVariableEnvironnement(nom: string): string | null {
  const valeur = import.meta.env[nom];

  if (typeof valeur !== 'string') {
    return null;
  }

  const valeurNettoyee = valeur.trim();

  return valeurNettoyee.length === 0 ? null : valeurNettoyee;
}

const idEcole = lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_ID');
const idUtilisateur = lireVariableEnvironnement('VITE_REFERENTIEL_UTILISATEUR_ID');
const nomOrganisation = lireVariableEnvironnement('VITE_REFERENTIEL_ORGANISATION_NOM')
  ?? 'Organisation à connecter';
const nomEcole = lireVariableEnvironnement('VITE_REFERENTIEL_ECOLE_NOM')
  ?? 'École courante';

export const contexteEcoleCourant: ContexteEcoleCourant = {
  idEcole,
  tenantId: idEcole,
  idUtilisateur,
  nomOrganisation,
  nomEcole,
};

export function contexteEcoleEstConfigure(): boolean {
  return contexteEcoleCourant.idEcole !== null && contexteEcoleCourant.tenantId !== null;
}
