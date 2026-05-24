// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditContextMapper {
  public static depuisContexte(valeur: Record<string, unknown> | undefined): { requestId?: string; correlationId?: string; sessionId?: string; adresseIp?: string; userAgent?: string; deviceId?: string; sourceAudit: string; modeOffline: boolean } {
    return {
      requestId: typeof valeur?.requestId === 'string' ? valeur.requestId : undefined,
      correlationId: typeof valeur?.correlationId === 'string' ? valeur.correlationId : undefined,
      sessionId: typeof valeur?.sessionId === 'string' ? valeur.sessionId : undefined,
      adresseIp: typeof valeur?.adresseIp === 'string' ? valeur.adresseIp : undefined,
      userAgent: typeof valeur?.userAgent === 'string' ? valeur.userAgent : undefined,
      deviceId: typeof valeur?.deviceId === 'string' ? valeur.deviceId : undefined,
      sourceAudit: typeof valeur?.sourceAudit === 'string' ? valeur.sourceAudit : 'APPLICATION',
      modeOffline: valeur?.modeOffline === true,
    };
  }

  public static versContexteLecture(valeur: Record<string, unknown> | undefined): Record<string, unknown> {
    return this.depuisContexte(valeur);
  }
}
