// Ces regles rappellent que tous les audits ne sont pas visibles par tous.
export class AuditConsultationRules {
  public static readonly CONSULTATION_SENSIBLE_CONTROLEE = 'Toute consultation sensible doit etre controlee.';
  public static readonly CONSULTATION_CROSS_TENANT_INTERDITE = 'Toute lecture cross-tenant est interdite.';
  public static readonly EXPORT_SENSIBLE_AUDITE = 'Tout export sensible doit etre lui-meme audite.';
}
