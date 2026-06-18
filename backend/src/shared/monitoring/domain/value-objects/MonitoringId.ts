// Ce fichier declare l identifiant metier du domaine Monitoring.

/** Cette classe represente un identifiant metier Monitoring. */
export class MonitoringId {
  private constructor(private readonly identifiant: string) {}

  /** Cette methode cree un identifiant Monitoring verifie. */
  public static creer(valeur: string): MonitoringId {
    return new MonitoringId(valeur.trim());
  }

  /** Cette methode retourne la valeur brute de l identifiant. */
  public valeur(): string {
    return this.identifiant;
  }
}
