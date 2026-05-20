import { Entite } from '../../../domain/Entity';

// Cette entite trace un appareil deja reconnu pour un utilisateur AUTH.
export class AppareilConnu extends Entite<string> {
  public readonly idUtilisateur: string;
  public readonly deviceId: string;
  public readonly nomAppareil?: string;
  public readonly dernierAccesLe?: Date;
  public estActif: boolean;

  constructor(params: {
    idAppareilConnu: string;
    idUtilisateur: string;
    deviceId: string;
    nomAppareil?: string;
    dernierAccesLe?: Date;
    estActif?: boolean;
  }) {
    super(AppareilConnu.validerTexte(params.idAppareilConnu, 'idAppareilConnu'));
    this.idUtilisateur = AppareilConnu.validerTexte(params.idUtilisateur, 'idUtilisateur');
    this.deviceId = AppareilConnu.validerTexte(params.deviceId, 'deviceId');
    this.nomAppareil = AppareilConnu.nettoyerOptionnel(params.nomAppareil);
    this.dernierAccesLe = params.dernierAccesLe ? new Date(params.dernierAccesLe.getTime()) : undefined;
    this.estActif = params.estActif ?? true;
  }

  // Cette methode met a jour la date du dernier acces connu pour l'appareil.
  public mettreAJourDernierAcces(dateAcces = new Date()): void {
    (this as { dernierAccesLe?: Date }).dernierAccesLe = new Date(dateAcces.getTime());
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }
    return valeur.trim();
  }

  private static nettoyerOptionnel(valeur?: string): string | undefined {
    const propre = String(valeur || '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
