// Ce service applicatif orchestre une famille de workflows Audit.
export class AuditMaskingApplicationService {
  public async nettoyerSnapshots(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { password, motDePasse, jwt, refreshToken, ...rest } = payload;
    void password; void motDePasse; void jwt; void refreshToken;
    return rest;
  }
  public async nettoyerMetadata(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { secret, apiKey, token, ...rest } = payload;
    void secret; void apiKey; void token;
    return rest;
  }
}
