import { MasqueurDonneesNotification } from './MasqueurDonneesNotification';
import { SecretTechniqueNotification } from './TypesSecuriteNotification';

// Ce fichier gere les secrets techniques utilises par le moteur Notifications.

/** Cette classe centralise un stockage memoire minimal des secrets techniques masques. */
export class GestionSecretsNotification {
  private readonly secrets = new Map<string, { valeur: string; enregistreLe: Date }>();

  /** Ce constructeur relie la gestion des secrets au masqueur de donnees. */
  constructor(private readonly masqueurDonneesNotification: MasqueurDonneesNotification) {}

  /** Cette methode enregistre un secret technique sans l'exposer tel quel. */
  public enregistrer(cle: string, valeur: string): void {
    this.secrets.set(cle, {
      valeur,
      enregistreLe: new Date(),
    });
  }

  /** Cette methode lit la valeur brute d'un secret pour un usage technique interne. */
  public lireValeur(cle: string): string | null {
    return this.secrets.get(cle)?.valeur ?? null;
  }

  /** Cette methode retourne la vue masquee d'un secret technique. */
  public lireSecretMasque(cle: string): SecretTechniqueNotification | null {
    const secret = this.secrets.get(cle);
    if (!secret) {
      return null;
    }

    return {
      cle,
      valeurMasquee: this.masqueurDonneesNotification.masquerValeur(secret.valeur),
      enregistreLe: secret.enregistreLe,
    };
  }
}
