// Ce fichier declare le runtime local de l infrastructure Monitoring.

/** Cette classe represente l etat runtime de l infrastructure Monitoring. */
export class RuntimeMonitoringInfrastructure {
  private demarre = false;

  /** Cette methode demarre le runtime d infrastructure. */
  public demarrer(): void {
    this.demarre = true;
  }

  /** Cette methode arrete le runtime d infrastructure. */
  public arreter(): void {
    this.demarre = false;
  }

  /** Cette methode indique si le runtime est demarre. */
  public estDemarre(): boolean {
    return this.demarre;
  }
}
