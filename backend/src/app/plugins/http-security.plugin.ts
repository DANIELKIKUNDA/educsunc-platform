import cors, { type FastifyCorsOptions } from '@fastify/cors';
import helmet from '@fastify/helmet';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { configurationApplication } from '../../config/app.config';

const originesLocales = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4174',
  'http://127.0.0.1:4174',
] as const;

const expressionOrigineHttp = /^https?:\/\/[a-z0-9.-]+(?::\d+)?$/iu;

export const methodesCorsFrontend = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as const;
export const entetesCorsFrontend = [
  'Accept',
  'Content-Type',
  'Authorization',
  'x-session-id',
  'x-device-id',
  'x-tenant-id',
  'x-organisation-id',
  'x-ecole-id',
  'x-user-id',
  'x-role-actif',
  'x-lecture-organisation',
  'Idempotency-Key',
  'x-request-id',
  'x-correlation-id',
  'x-offline-mode',
] as const;

interface ConfigurationSocleHttp {
  environnement?: 'development' | 'test' | 'production';
  originesSupplementaires?: string;
}

export function resoudreOriginesFrontendAutorisees(
  configuration: ConfigurationSocleHttp = {},
): ReadonlySet<string> {
  const environnement = configuration.environnement ?? configurationApplication.environnement;
  const originesSupplementaires = String(
    configuration.originesSupplementaires ?? process.env.EDUCSYN_CORS_ADDITIONAL_ORIGINS ?? '',
  )
    .split(',')
    .map((origine) => origine.trim())
    .filter((origine) => expressionOrigineHttp.test(origine));

  return new Set([
    ...(environnement === 'production' ? [] : originesLocales),
    ...originesSupplementaires,
  ]);
}

export async function configurerCorsFrontend(
  serveur: FastifyInstance,
  configuration: ConfigurationSocleHttp = {},
): Promise<void> {
  const originesAutorisees = resoudreOriginesFrontendAutorisees(configuration);
  const options: FastifyCorsOptions = {
    allowedHeaders: [...entetesCorsFrontend],
    credentials: true,
    maxAge: 600,
    methods: [...methodesCorsFrontend],
    origin: (origine, callback) => {
      callback(null, origine === undefined || originesAutorisees.has(origine));
    },
    optionsSuccessStatus: 204,
    strictPreflight: true,
  };

  await serveur.register(cors, options);
}

export async function configurerSocleHttp(
  serveur: FastifyInstance,
  configuration: ConfigurationSocleHttp = {},
): Promise<void> {
  await configurerCorsFrontend(serveur, configuration);
  await serveur.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  serveur.setErrorHandler((erreur, requete, reponse) => {
    traiterErreurHttp(erreur, requete, reponse);
  });
  serveur.setNotFoundHandler((_requete, reponse) => {
    reponse.code(404).send({
      success: false,
      code: 'ROUTE_INTROUVABLE',
      message: 'La ressource demandee est introuvable.',
    });
  });
}

function traiterErreurHttp(
  erreur: unknown,
  requete: FastifyRequest,
  reponse: FastifyReply,
): void {
  const erreurStructuree = typeof erreur === 'object' && erreur !== null
    ? erreur as { code?: unknown; statusCode?: unknown }
    : undefined;
  const codeTechnique = typeof erreurStructuree?.code === 'string'
    ? erreurStructuree.code
    : undefined;
  const statut = normaliserStatutHttp(erreurStructuree?.statusCode);
  const erreurInterne = statut >= 500;
  const contexteJournal = {
    code: codeTechnique,
    erreur: erreurInterne && erreur instanceof Error ? erreur : undefined,
    methode: requete.method,
    requestId: requete.context?.requestId ?? String(requete.id),
    route: requete.routeOptions.url ?? requete.url,
    statut,
  };

  if (erreurInterne) {
    requete.log.error(contexteJournal, 'Echec interne du traitement HTTP.');
  } else {
    requete.log.warn(contexteJournal, 'Requete HTTP refusee.');
  }

  const erreurPublique = construireErreurPublique(statut);
  reponse.code(statut).send({
    success: false,
    ...erreurPublique,
  });
}

function normaliserStatutHttp(statut: unknown): number {
  return typeof statut === 'number' && statut >= 400 && statut <= 599 ? statut : 500;
}

function construireErreurPublique(statut: number): { code: string; message: string } {
  if (statut === 400) {
    return { code: 'REQUETE_INVALIDE', message: 'Certaines informations transmises sont invalides.' };
  }
  if (statut === 404) {
    return { code: 'ROUTE_INTROUVABLE', message: 'La ressource demandee est introuvable.' };
  }
  if (statut === 413) {
    return { code: 'CONTENU_TROP_VOLUMINEUX', message: 'Le contenu transmis depasse la taille autorisee.' };
  }
  if (statut === 429) {
    return { code: 'TROP_DE_REQUETES', message: 'Trop de demandes ont ete envoyees. Reessayez plus tard.' };
  }
  if (statut >= 500) {
    return {
      code: 'ERREUR_INTERNE',
      message: "Une erreur interne s'est produite. Reessayez dans quelques instants.",
    };
  }

  return { code: 'ACTION_HTTP_REFUSEE', message: "L'action demandee n'a pas pu etre terminee." };
}
