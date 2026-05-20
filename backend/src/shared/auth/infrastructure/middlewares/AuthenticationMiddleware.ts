import { JwtTokenPort } from '../../application/ports/crypto/JwtTokenPort';

// Ce middleware technique extrait et verifie un bearer token AUTH.
export class AuthenticationMiddleware {
  constructor(private readonly jwtTokenPort: JwtTokenPort) {}

  public async authentifier(authorizationHeader?: string): Promise<Record<string, unknown> | null> {
    const brut = String(authorizationHeader || '').trim();
    if (!brut.startsWith('Bearer ')) {
      return null;
    }

    const token = brut.slice('Bearer '.length).trim();
    return this.jwtTokenPort.decoderJwt<Record<string, unknown>>(token);
  }
}
