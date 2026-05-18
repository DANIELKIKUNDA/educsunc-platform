// Ce fichier decrit seulement les informations d'isolation dont le domaine a besoin.
export interface ContexteIsolationTenant {
  // Cette methode retourne le tenant ecole actuellement cible.
  obtenirTenant(): string;

  // Cette methode indique si l'appel courant est une lecture organisationnelle.
  estEnLectureOrganisationnelle(): boolean;

  // Cette methode retourne l'organisation courante lorsqu'elle existe.
  obtenirOrganisation(): string | null;
}
