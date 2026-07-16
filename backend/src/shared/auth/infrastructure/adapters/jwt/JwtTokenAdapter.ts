import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { chargerConfigurationAuth, type ConfigurationAuth } from '../../../../../config/auth.config';
import { JwtTokenPort } from '../../../application/ports/crypto/JwtTokenPort';

export interface ClaimsAccessToken extends Record<string, unknown> {
  sub: string;
  sid: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
  jti: string;
  tokenVersion: number;
}

// Cet adaptateur emet et verifie exclusivement des JWT HS256 a duree courte.
export class JwtTokenAdapter implements JwtTokenPort {
  private readonly configuration: ConfigurationAuth;

  constructor(configuration?: string | Partial<ConfigurationAuth>) {
    const base = chargerConfigurationAuth();
    this.configuration = typeof configuration === 'string'
      ? { ...base, secretJwt: configuration }
      : { ...base, ...configuration };
  }

  public async genererJwt(payload: Record<string, unknown>): Promise<string> {
    return this.signerJwt(payload);
  }

  public async verifierJwt(token: string): Promise<boolean> {
    try { await this.decoderJwt(token); return true; } catch { return false; }
  }

  public async signerJwt(payload: Record<string, unknown>): Promise<string> {
    return this.signerJwtSynchrone(payload);
  }

  public signerJwtSynchrone(payload: Record<string, unknown>): string {
    const maintenant = Math.floor(Date.now() / 1000);
    const claims: ClaimsAccessToken = {
      ...payload,
      sub: this.exigerChaine(payload.sub, 'sub'),
      sid: this.exigerChaine(payload.sid, 'sid'),
      tokenVersion: this.exigerEntier(payload.tokenVersion, 'tokenVersion'),
      iat: maintenant,
      exp: maintenant + this.configuration.dureeAccessTokenSecondes,
      iss: this.configuration.emetteur,
      aud: this.configuration.audience,
      jti: randomUUID(),
    };
    const entete = this.encoder({ alg: 'HS256', typ: 'JWT' });
    const corps = this.encoder(claims);
    return `${entete}.${corps}.${this.signer(`${entete}.${corps}`)}`;
  }

  public async decoderJwt<TPayload = Record<string, unknown>>(token: string): Promise<TPayload> {
    const parties = String(token || '').split('.');
    if (parties.length !== 3) throw new Error('Jeton invalide.');
    const [enteteEncode, corpsEncode, signature] = parties;
    const attendue = this.signer(`${enteteEncode}.${corpsEncode}`);
    const signatureBuffer = Buffer.from(signature);
    const attendueBuffer = Buffer.from(attendue);
    if (signatureBuffer.length !== attendueBuffer.length || !timingSafeEqual(signatureBuffer, attendueBuffer)) {
      throw new Error('Jeton invalide.');
    }
    const entete = this.decoder(enteteEncode) as { alg?: unknown; typ?: unknown };
    if (entete.alg !== 'HS256' || entete.typ !== 'JWT') throw new Error('Jeton invalide.');
    const payload = this.decoder(corpsEncode) as Record<string, unknown>;
    this.validerClaims(payload);
    return payload as TPayload;
  }

  public async creerRefreshTokenOpaque(): Promise<string> {
    return randomBytes(48).toString('base64url');
  }

  public async hacherRefreshToken(refreshToken: string): Promise<string> {
    return this.hacherRefreshTokenSynchrone(refreshToken);
  }

  public hacherRefreshTokenSynchrone(refreshToken: string): string {
    return createHmac('sha256', this.configuration.secretJwt).update(String(refreshToken || '')).digest('hex');
  }

  private validerClaims(payload: Record<string, unknown>): void {
    this.exigerChaine(payload.sub, 'sub');
    this.exigerChaine(payload.sid, 'sid');
    this.exigerChaine(payload.jti, 'jti');
    this.exigerEntier(payload.tokenVersion, 'tokenVersion');
    const iat = this.exigerEntier(payload.iat, 'iat');
    const exp = this.exigerEntier(payload.exp, 'exp');
    if (exp <= Math.floor(Date.now() / 1000) || exp <= iat) throw new Error('Jeton expire.');
    if (payload.iss !== this.configuration.emetteur || payload.aud !== this.configuration.audience) {
      throw new Error('Jeton invalide.');
    }
  }

  private signer(message: string): string {
    return createHmac('sha256', this.configuration.secretJwt).update(message).digest('base64url');
  }

  private encoder(valeur: unknown): string { return Buffer.from(JSON.stringify(valeur)).toString('base64url'); }
  private decoder(valeur: string): unknown { return JSON.parse(Buffer.from(valeur, 'base64url').toString('utf8')); }
  private exigerChaine(valeur: unknown, champ: string): string {
    if (typeof valeur !== 'string' || !valeur.trim()) throw new Error(`Claim ${champ} manquant.`);
    return valeur.trim();
  }
  private exigerEntier(valeur: unknown, champ: string): number {
    if (!Number.isInteger(valeur) || Number(valeur) <= 0) throw new Error(`Claim ${champ} invalide.`);
    return Number(valeur);
  }
}
