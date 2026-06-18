import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import type {
  ControleurConfigurationHttp,
  ControleurPropagationConfigurationHttp,
  ControleurReloadRuntimeConfigurationHttp,
  ControleurSnapshotsConfigurationHttp,
  ControleurValidationConfigurationHttp,
} from '../controllers';

// Ce fichier declare les dependances des routes HTTP Configuration.

export interface JeuMiddlewaresRoutesConfiguration {
  onRequest?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  auth?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  tenant?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  observability?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  validation?(requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierPermission?(permission: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierScope?(scope: string, requete: FastifyRequest, reponse: FastifyReply): Promise<void> | void;
  verifierFamille?(
    action: 'READ' | 'WRITE',
    requete: FastifyRequest,
    reponse: FastifyReply,
  ): Promise<void> | void;
  gererErreur?(
    erreur: unknown,
    requete: FastifyRequest,
    reponse: FastifyReply,
  ): Promise<{ statutHttp: number; corps: unknown } | void> | { statutHttp: number; corps: unknown } | void;
}

export interface DependancesRoutesConfiguration {
  controleurConfigurationHttp: ControleurConfigurationHttp;
  controleurSnapshotsConfigurationHttp: ControleurSnapshotsConfigurationHttp;
  controleurValidationConfigurationHttp: ControleurValidationConfigurationHttp;
  controleurPropagationConfigurationHttp: ControleurPropagationConfigurationHttp;
  controleurReloadRuntimeConfigurationHttp: ControleurReloadRuntimeConfigurationHttp;
  middlewares?: JeuMiddlewaresRoutesConfiguration;
}

export type FabriqueRoutesConfiguration = (
  dependances: DependancesRoutesConfiguration,
) => FastifyPluginAsync;
