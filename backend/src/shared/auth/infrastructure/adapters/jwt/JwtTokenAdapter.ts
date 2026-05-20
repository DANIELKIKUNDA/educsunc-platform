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

    return JSON.parse(Buffer.from(corps, 'base64url').toString('utf8')) as TPayload;
  }

  public async creerRefreshTokenOpaque(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  public async hacherRefreshToken(refreshToken: string): Promise<string> {
    return createHmac('sha256', this.secret).update(String(refreshToken || '')).digest('hex');
  }
}
