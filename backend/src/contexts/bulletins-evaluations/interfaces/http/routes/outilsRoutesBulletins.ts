import type { FastifyReply, FastifyRequest } from 'fastify';
import { ContexteTenant } from 'shared/tenancy/TenantContext';
import { ErrorPresenter } from '../presenters/ErrorPresenter';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Cette fonction applique le contexte tenant shared a partir des headers HTTP.
export function appliquerTenantDepuisRequete(requete: FastifyRequest, contexteTenant?: ContexteTenant): void {
  if (contexteTenant === undefined) {
    return;
  }

  const idOrganisation = ValidationHttpBulletinsEvaluations.lireHeaderChaine(requete.headers, 'x-organisation-id');
  const idEcole = ValidationHttpBulletinsEvaluations.lireHeaderChaine(requete.headers, 'x-tenant-id');
  const lectureOrganisationnelle =
    ValidationHttpBulletinsEvaluations.lireHeaderChaine(requete.headers, 'x-lecture-organisationnelle') === 'true';

  if (idOrganisation !== undefined) {
    contexteTenant.definirOrganisation(idOrganisation);
  }

  if (lectureOrganisationnelle) {
    contexteTenant.activerLectureOrganisationnelle();
    return;
  }

  if (idEcole !== undefined) {
    contexteTenant.definirTenant(idEcole);
  }
}

// Cette fonction factorise le traitement d'erreur et le nettoyage du contexte tenant.
export async function executerRouteBulletin(
  requete: FastifyRequest,
  reponse: FastifyReply,
  operation: () => Promise<unknown>,
  contexteTenant?: ContexteTenant,
  statutSucces = 200,
): Promise<FastifyReply> {
  try {
    appliquerTenantDepuisRequete(requete, contexteTenant);
    const resultat = await operation();
    return reponse.code(statutSucces).send(resultat);
  } catch (erreur) {
    const erreurPresentee = ErrorPresenter.presenterErreur(erreur);
    return reponse.code(erreurPresentee.statutHttp).send(erreurPresentee.corps);
  } finally {
    contexteTenant?.reinitialiserTenant();
  }
}
