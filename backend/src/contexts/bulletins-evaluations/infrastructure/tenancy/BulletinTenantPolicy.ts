// Ce fichier porte les regles techniques minimales de validation de tenant pour le BC.
export class BulletinTenantPolicy {
  // Cette methode verifie qu'un identifiant d'ecole est bien fourni.
  public verifierIdEcole(idEcole: string): void {
    if (idEcole.trim().length === 0) {
      throw new Error('Le tenant ecole du BC Bulletins est obligatoire.');
    }
  }
}
