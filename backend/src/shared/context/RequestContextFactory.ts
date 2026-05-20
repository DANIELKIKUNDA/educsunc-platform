import { randomUUID } from 'node:crypto';
import type { RequestContext } from './RequestContext';
import type { EnrichissementAuthContext, EnrichissementSecurityContext } from './ContextTypes';
import { CONTEXT_ROLE_PAR_DEFAUT } from './ContextConstants';

// Cette fabrique cree et enrichit le contexte runtime officiel partage par les plugins globaux.
export class RequestContextFactory {
  // Cette methode cree le contexte initial minimal avant authentification.
  public static creerContexteInitial(params?: {
    requestId?: string;
    adresseIp?: string;
    userAgent?: string;
    deviceId?: string;
  }): RequestContext {
    return {
      requestId: RequestContextFactory.nettoyerOptionnel(params?.requestId) ?? randomUUID(),
      permissions: [],
      scopes: [],
      restrictions: [],
      titulariats: [],
      modeOffline: false,
      adresseIp: RequestContextFactory.nettoyerOptionnel(params?.adresseIp),
      userAgent: RequestContextFactory.nettoyerOptionnel(params?.userAgent),
      deviceId: RequestContextFactory.nettoyerOptionnel(params?.deviceId),
    };
  }

  // Cette methode applique les donnees identitaires d AUTH sur un contexte existant.
  public static enrichirAuth(
    contexte: RequestContext,
    enrichissement: EnrichissementAuthContext,
  ): RequestContext {
    return {
      ...contexte,
      utilisateurId: enrichissement.utilisateurId.trim(),
      sessionId: RequestContextFactory.nettoyerOptionnel(enrichissement.sessionId),
      roleActif:
        RequestContextFactory.nettoyerOptionnel(enrichissement.roleActif)
        ?? contexte.roleActif
        ?? CONTEXT_ROLE_PAR_DEFAUT,
      organisationActiveId: RequestContextFactory.nettoyerOptionnel(
        enrichissement.organisationActiveId,
      ),
      ecoleActiveId: RequestContextFactory.nettoyerOptionnel(
        enrichissement.ecoleActiveId,
      ),
      modeOffline: Boolean(enrichissement.modeOffline),
      deviceId:
        RequestContextFactory.nettoyerOptionnel(enrichissement.deviceId)
        ?? contexte.deviceId,
    };
  }

  // Cette methode applique les donnees d autorisation et de portee sur un contexte existant.
  public static enrichirSecurity(
    contexte: RequestContext,
    enrichissement: EnrichissementSecurityContext,
  ): RequestContext {
    return {
      ...contexte,
      roleActif:
        RequestContextFactory.nettoyerOptionnel(enrichissement.roleActif)
        ?? contexte.roleActif
        ?? CONTEXT_ROLE_PAR_DEFAUT,
      permissions: RequestContextFactory.nettoyerListeTextes(enrichissement.permissions),
      scopes: enrichissement.scopes ? [...enrichissement.scopes] : [],
      restrictions: RequestContextFactory.nettoyerListeTextes(enrichissement.restrictions),
      titulariats: enrichissement.titulariats ? [...enrichissement.titulariats] : [],
    };
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    if (typeof valeur !== 'string') {
      return undefined;
    }

    const propre = valeur.trim();
    return propre === '' ? undefined : propre;
  }

  private static nettoyerListeTextes(valeurs?: readonly string[]): string[] {
    if (!valeurs) {
      return [];
    }

    return Array.from(
      new Set(
        valeurs
          .filter((valeur): valeur is string => typeof valeur === 'string')
          .map((valeur) => valeur.trim())
          .filter((valeur) => valeur !== ''),
      ),
    );
  }
}
