import { ErreurTenantInvalide } from './exceptions/ErreurTenantInvalide';

// Ce resolveur extrait de maniere transverse les informations de tenancy depuis plusieurs emplacements controles.
// Le tenant peut venir d'entetes, de query params ou de params de route selon le point d'entree utilise.
export class ResolveurTenant {
  // Cette methode normalise une valeur candidate en chaine exploitable.
  private normaliserValeurTexte(valeur: unknown): string | null {
    if (valeur === null || valeur === undefined) {
      return null;
    }

    if (Array.isArray(valeur)) {
      const premiereValeur = valeur.find((element) => typeof element === 'string');
      return typeof premiereValeur === 'string' ? premiereValeur.trim() : null;
    }

    if (typeof valeur === 'string') {
      return valeur.trim();
    }

    return null;
  }

  // Cette methode lit une valeur d'entete en prenant en charge les formes usuelles de requete HTTP.
  private lireEntete(requete: any, nomEntete: string): string | null {
    const contexte = requete?.context;

    if (contexte && nomEntete === 'x-tenant-id') {
      const valeurContexte = this.normaliserValeurTexte(contexte.ecoleActiveId);
      if (valeurContexte !== null) {
        return valeurContexte;
      }
    }

    if (contexte && nomEntete === 'x-organisation-id') {
      const valeurContexte = this.normaliserValeurTexte(contexte.organisationActiveId);
      if (valeurContexte !== null) {
        return valeurContexte;
      }
    }

    const entetes = requete?.headers;

    if (entetes?.get && typeof entetes.get === 'function') {
      return this.normaliserValeurTexte(entetes.get(nomEntete));
    }

    return this.normaliserValeurTexte(entetes?.[nomEntete]);
  }

  // Cette methode lit une valeur dans un conteneur simple comme query ou params.
  private lirePropriete(conteneur: any, cle: string): string | null {
    return this.normaliserValeurTexte(conteneur?.[cle]);
  }

  // Cette methode verifie qu'une valeur ressourcee n'est pas vide avant utilisation.
  private validerPresence(valeur: string | null, messageErreur: string): string {
    if (valeur === null || valeur.length === 0) {
      throw new ErreurTenantInvalide(messageErreur);
    }

    return valeur;
  }

  // Cette methode resout le tenant courant depuis les emplacements autorises de la requete.
  public resoudreDepuisRequete(requete: any): string {
    const valeurEntete = this.lireEntete(requete, 'x-tenant-id');
    const valeurQuery = this.lirePropriete(requete?.query, 'idEcole');
    const valeurParams = this.lirePropriete(requete?.params, 'idEcole');

    return this.validerPresence(
      valeurEntete ?? valeurQuery ?? valeurParams,
      "Impossible de resoudre un tenant valide depuis la requete.",
    );
  }

  // Cette methode resout l'organisation courante si une lecture transverse en depend.
  public resoudreOrganisationDepuisRequete(requete: any): string | null {
    const valeurEntete = this.lireEntete(requete, 'x-organisation-id');
    const valeurQuery = this.lirePropriete(requete?.query, 'idOrganisation');
    const valeurParams = this.lirePropriete(requete?.params, 'idOrganisation');
    const valeur = valeurEntete ?? valeurQuery ?? valeurParams;

    if (valeur === null) {
      return null;
    }

    if (valeur.length === 0) {
      throw new ErreurTenantInvalide("L'identifiant d'organisation fourni est invalide.");
    }

    return valeur;
  }

  // Cette methode detecte le mode de lecture organisationnelle via un entete technique controle.
  public detecterLectureOrganisationnelle(requete: any): boolean {
    const valeur = this.lireEntete(requete, 'x-lecture-organisation');

    return valeur === 'true';
  }
}
