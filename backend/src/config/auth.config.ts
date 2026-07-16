import { randomBytes } from 'node:crypto';
import { configurationApplication } from './app.config';

const lireEntierPositif = (valeur: string | undefined, defaut: number): number => {
  const nombre = Number(valeur);
  return Number.isInteger(nombre) && nombre > 0 ? nombre : defaut;
};

export interface ConfigurationAuth {
  secretJwt: string;
  emetteur: string;
  audience: string;
  dureeAccessTokenSecondes: number;
}

export function verifierSecretJwtProduction(environnement: string, secretConfigure?: string): void {
  if (environnement === 'production' && (!secretConfigure || secretConfigure.trim().length < 32)) {
    throw new Error('EDUCSYN_JWT_SECRET est obligatoire et doit contenir au moins 32 caracteres en production.');
  }
}

export function chargerConfigurationAuth(): ConfigurationAuth {
  const production = configurationApplication.environnement === 'production';
  const secretConfigure = process.env.EDUCSYN_JWT_SECRET?.trim();
  verifierSecretJwtProduction(production ? 'production' : configurationApplication.environnement, secretConfigure);

  const secretDeveloppement = process.env.EDUCSYN_DEVELOPMENT_JWT_SECRET?.trim()
    || 'educsyn-development-only-jwt-secret-2026-change-me';
  return {
    secretJwt: secretConfigure || secretDeveloppement,
    emetteur: process.env.EDUCSYN_JWT_ISSUER?.trim() || 'educsyn-api',
    audience: process.env.EDUCSYN_JWT_AUDIENCE?.trim() || 'educsyn-clients',
    dureeAccessTokenSecondes: lireEntierPositif(process.env.EDUCSYN_ACCESS_TOKEN_TTL_SECONDS, 900),
  };
}

export function genererSecretJwtProduction(): string {
  return randomBytes(48).toString('base64url');
}
