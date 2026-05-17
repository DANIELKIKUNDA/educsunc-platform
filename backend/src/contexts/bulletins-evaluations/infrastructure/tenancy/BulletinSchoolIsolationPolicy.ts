// Ce fichier porte la regle technique d'isolation stricte par ecole.
export class BulletinSchoolIsolationPolicy {
  // Cette methode compare l'ecole cible a l'ecole du contexte pour bloquer les fuites inter-ecoles.
  public verifierAcces(idEcoleContexte: string, idEcoleCible: string): void {
    if (idEcoleContexte !== idEcoleCible) {
      throw new Error('Acces inter-ecoles interdit dans le BC Bulletins.');
    }
  }
}
