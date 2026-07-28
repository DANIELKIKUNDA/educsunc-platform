import { createHash } from 'node:crypto';
import { RateLimitMiddleware } from './RateLimitMiddleware';

const FENETRE_RAFRAICHISSEMENT_MS = 60_000;
const LIMITE_RAFRAICHISSEMENTS_PAR_SESSION = 10;
const LIMITE_RAFRAICHISSEMENTS_PAR_ADRESSE = 60;

interface RefreshRateLimitRequest {
  readonly adresseIp: string;
  readonly corps: unknown;
  readonly headers: unknown;
}

function lireChaine(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) return lireChaine(value[0]);
  return undefined;
}

function lireSessionId(corps: unknown, headers: unknown): string {
  const entetes = typeof headers === 'object' && headers !== null
    ? headers as Record<string, unknown>
    : {};
  const donnees = typeof corps === 'object' && corps !== null
    ? corps as Record<string, unknown>
    : {};
  return lireChaine(entetes['x-session-id'])
    ?? lireChaine(donnees.sessionId)
    ?? 'session-absente';
}

function empreinteSession(sessionId: string): string {
  return createHash('sha256').update(sessionId).digest('hex').slice(0, 24);
}

// Les appareils d'une même école partagent souvent une adresse IP publique.
export class RefreshRateLimitPolicy {
  constructor(private readonly rateLimitMiddleware: RateLimitMiddleware) {}

  public verifier(requete: RefreshRateLimitRequest): void {
    const adresseIp = requete.adresseIp.trim() || 'adresse-inconnue';
    const session = empreinteSession(lireSessionId(requete.corps, requete.headers));

    this.rateLimitMiddleware.verifier(
      `refresh:ip:${adresseIp}`,
      LIMITE_RAFRAICHISSEMENTS_PAR_ADRESSE,
      FENETRE_RAFRAICHISSEMENT_MS,
    );
    this.rateLimitMiddleware.verifier(
      `refresh:session:${adresseIp}:${session}`,
      LIMITE_RAFRAICHISSEMENTS_PAR_SESSION,
      FENETRE_RAFRAICHISSEMENT_MS,
    );
  }
}
