// Ces regles synthétisent les invariants offline-first du domaine Audit.
export class AuditOfflineRules {
  public static readonly ACTION_OFFLINE_NE_DOIT_PAS_DISPARAITRE = 'Une action offline ne doit jamais disparaitre.';
  public static readonly SYNCHRONISATION_DOIT_ETRE_TRACEE = 'La synchronisation doit rester tracable.';
  public static readonly CONFLIT_DOIT_ETRE_JUSTIFIE = 'Un conflit offline doit rester explicable.';
  public static readonly DOUBLON_DOIT_RESTER_VISIBLE = 'Une action ignoree pour doublon doit rester visible dans l audit.';
}
