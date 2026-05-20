import { randomBytes, createHash } from 'node:crypto';

// Cet adaptateur gere la generation et le hash des refresh tokens.
export class RefreshTokenAdapter {
  public async genererRefreshToken(): Promise<string> {
    return randomBytes(32).toString('hex');
  }

  public async hacherRefreshToken(refreshToken: string): Promise<string> {
    return createHash('sha256').update(String(refreshToken || '')).digest('hex');
  }

  public async verifierRefreshToken(refreshToken: string, hashAttendu: string): Promise<boolean> {
    return (await this.hacherRefreshToken(refreshToken)) === String(hashAttendu || '');
  }
}
