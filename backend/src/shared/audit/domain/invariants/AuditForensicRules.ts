// Ces regles garantissent un minimum de donnees exploitables pour l investigation.
export class AuditForensicRules {
  public static readonly REQUEST_CONTEXT_ATTENDU = 'Le request context doit rester exploitable.';
  public static readonly SOURCE_RUNTIME_ATTENDUE = 'La source runtime doit etre preservee.';
  public static readonly CORRELATION_RECOMMANDEE = 'Les operations complexes doivent rester correlables.';
  public static readonly PERMISSIONS_HISTORIQUES_EXIGEES = 'Les permissions historiques doivent rester disponibles.';
}
