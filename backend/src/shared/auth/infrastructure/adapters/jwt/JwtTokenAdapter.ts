import { createHmac, randomBytes } from 'node:crypto';
import { JwtTokenPort } from '../../../application/ports/crypto/JwtTokenPort';

// Cet adaptateur implemente la gestion technique des JWT pour AUTH.
export class JwtTokenAdapter implements JwtTokenPort {
  constructor(private readonly secret: string = 'dev-secret-change-me') {}

  public async genererJwt(payload: Record<string, unknown>): Promise<string> {
    return this.signerJwt(payload);
  }

  public async verifierJwt(token: string): Promise<boolean> {
    try {
      await this.decoderJwt(token);
      return true;
    } catch {
      return false;
    }
  }

  public async signerJwt(payload: Record<string, unknown>): Promise<string> {
    const corps = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const nonce = randomBytes(16).toString('base64url');
    const signature = createHmac('sha256', this.secret).update(`${corps}.${nonce}`).digest('base64url');
    return `${corps}.${nonce}.${signature}`;
  }

  public async decoderJwt<TPayload = Record<string, unknown>>(token: string): Promise<TPayload> {
    const brut = String(token || '');
    const parties = brut.split('.');
    if (parties.length !== 3) {
      throw new Error('Token invalide');
    }

    const [corps, nonce, signature] = parties;
    const attendue = createHmac('sha256', this.secret).update(`${corps}.${nonce}`).digest('base64url');
    if (signature !== attendue) {
      throw new Error('Signature JWT invalide');
    }

    const payload = JSON.parse(Buffer.from(corps, 'base64url').toString('utf8')) as TPayload & {
      exp?: number | string;
    };
    const expiration = this.extraireExpiration(payload.exp);
    if (expiration && expiration.getTime() <= Date.now()) {
      throw new Error('Token expire');
    }

    return payload as TPayload;
  }

  public async creerRefreshTokenOpaque(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  public async hacherRefreshToken(refreshToken: string): Promise<string> {
    return createHmac('sha256', this.secret).update(String(refreshToken || '')).digest('hex');
  }

  private extraireExpiration(exp?: number | string): Date | null {
    if (typeof exp !== 'number' && typeof exp !== 'string') {
      return null;
    }

    const valeur = Number(exp);
    if (!Number.isFinite(valeur) || valeur <= 0) {
      return null;
    }

    const millisecondes = valeur < 1_000_000_000_000 ? valeur * 1000 : valeur;
    return new Date(millisecondes);
  }
}
