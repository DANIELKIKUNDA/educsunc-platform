// Cette policy rappelle que l'audit doit toujours permettre une reconstruction historique.
export class PolicyAuditHistorisation {
  public static doitSupporterTimeline(): true {
    return true;
  }
}
