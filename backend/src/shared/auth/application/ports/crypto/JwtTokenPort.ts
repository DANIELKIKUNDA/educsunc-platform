// Ce port encapsule la generation et la verification technique des jetons.
export interface JwtTokenPort {
  genererJwt(payload: Record<string, unknown>): Promise<string>;
  verifierJwt(token: string): Promise<boolean>;
  signerJwt(payload: Record<string, unknown>): Promise<string>;
  decoderJwt<TPayload = Record<string, unknown>>(token: string): Promise<TPayload>;
  creerRefreshTokenOpaque(): Promise<string>;
  hacherRefreshToken(refreshToken: string): Promise<string>;
}
