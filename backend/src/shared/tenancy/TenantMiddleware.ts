import { ContexteTenant } from './TenantContext';
import { ResolveurTenant } from './TenantResolver';

// Ce middleware enrichit le contexte tenant global a partir d'une requete entrante sans executer de logique metier.
export const creerMiddlewareTenant = (
  contexteTenant: ContexteTenant,
  resolveurTenant: ResolveurTenant,
) => {
  // Cette fonction middleware prepare le contexte technique de tenancy pour la suite du pipeline.
  return async (requete: any, reponse: any): Promise<void> => {
    void reponse;

    try {
      contexteTenant.reinitialiserTenant();

      const idTenant = resolveurTenant.resoudreDepuisRequete(requete);
      contexteTenant.definirTenant(idTenant);

      const idOrganisation = resolveurTenant.resoudreOrganisationDepuisRequete(requete);

      if (idOrganisation !== null) {
        contexteTenant.definirOrganisation(idOrganisation);
      }

      if (resolveurTenant.detecterLectureOrganisationnelle(requete)) {
        contexteTenant.activerLectureOrganisationnelle();
      } else {
        contexteTenant.desactiverLectureOrganisationnelle();
      }
    } catch (erreur) {
      contexteTenant.reinitialiserTenant();
      throw erreur;
    }
  };
};
