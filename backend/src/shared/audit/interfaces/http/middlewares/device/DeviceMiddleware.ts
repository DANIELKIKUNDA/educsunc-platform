import type { FastifyRequest } from 'fastify';
import { obtenirContexte } from '../AuditMiddlewareSupport';
import type { DeviceContext } from './DeviceContext';

function lireHeaderTexte(requete: FastifyRequest, nom: string): string | undefined {
  const valeur = requete.headers[nom];
  if (typeof valeur === 'string') {
    const propre = valeur.trim();
    return propre === '' ? undefined : propre;
  }

  if (Array.isArray(valeur) && typeof valeur[0] === 'string') {
    const propre = valeur[0].trim();
    return propre === '' ? undefined : propre;
  }

  return undefined;
}

// Ce middleware injecte le contexte appareil critique pour forensic et offline-first.
export class DeviceMiddleware {
  public appliquer(requete: FastifyRequest): DeviceContext {
    const contexte = obtenirContexte(requete);
    const device: DeviceContext = {
      deviceId: contexte.deviceId ?? lireHeaderTexte(requete, 'x-device-id'),
      appVersion: contexte.appVersion ?? lireHeaderTexte(requete, 'x-app-version'),
      plateforme: contexte.plateforme ?? lireHeaderTexte(requete, 'x-platform'),
      modeOffline: contexte.modeOffline || lireHeaderTexte(requete, 'x-offline-mode') === 'true',
      syncId: contexte.syncId ?? lireHeaderTexte(requete, 'x-sync-id'),
    };

    requete.context = {
      ...contexte,
      deviceId: device.deviceId,
      appVersion: device.appVersion,
      plateforme: device.plateforme,
      modeOffline: device.modeOffline,
      syncId: device.syncId,
    };

    return device;
  }
}

