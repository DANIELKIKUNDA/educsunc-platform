import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { REQUEST_CONTEXT_HEADER_ORGANISATION, REQUEST_CONTEXT_HEADER_TENANT } from 'shared/context';
import { SecurityTenantIsolationService } from 'shared/security/infrastructure';

type PluginGlobal = FastifyPluginAsync & { nom: string };

const securityTenantIsolationService = new SecurityTenantIsolationService();

// Ce plugin relie la decision de tenancy technique au RequestContext deja enrichi.
export const tenancyPlugin: PluginGlobal = Object.assign(
  async (serveur: Parameters<FastifyPluginAsync>[0]) => {
    serveur.addHook('preHandler', async (requete: FastifyRequest, reponse: FastifyReply) => {
      const idOrganisationHeader = lireHeader(requete.headers, REQUEST_CONTEXT_HEADER_ORGANISATION);
      const idEcoleHeader = lireHeader(requete.headers, REQUEST_CONTEXT_HEADER_TENANT);
      const idOrganisationContexte = requete.context?.organisationActiveId;
      const idEcoleContexte = requete.context?.ecoleActiveId;

      try {
        securityTenantIsolationService.verifierOrganisation(
          idOrganisationHeader,
          idOrganisationContexte,
        );
        securityTenantIsolationService.verifierEcole(idEcoleHeader, idEcoleContexte);

        if (idOrganisationContexte) {
          requete.headers[REQUEST_CONTEXT_HEADER_ORGANISATION] = idOrganisationContexte;
        }
        if (idEcoleContexte) {
          requete.headers[REQUEST_CONTEXT_HEADER_TENANT] = idEcoleContexte;
        }
      } catch (erreur) {
        return reponse.code(403).send({
          success: false,
          message:
            erreur instanceof Error
              ? erreur.message
              : 'Contexte tenant invalide.',
        });
      }
    });
  },
  {
    nom: 'tenancy',
  },
);

function lireHeader(headers: FastifyRequest['headers'], nom: string): string | undefined {
  const valeur = headers[nom];
  if (typeof valeur !== 'string') {
    return undefined;
  }

  const propre = valeur.trim();
  return propre === '' ? undefined : propre;
}
