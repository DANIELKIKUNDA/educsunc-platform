import { ClientRedisShared, FabriqueConnexionRedisShared } from 'shared/infrastructure/redis';
import { CleThrottlingNotification, ResultatThrottlingNotification } from './TypesThrottlingNotification';

type EmissionRateLimitingBullMq = {
  readonly horodatage: number;
};

// Ce fichier implemente la variante Redis/BullMQ du rate limiting Notifications.

/** Cette classe projette une fenetre glissante compatible BullMQ dans Redis partage. */
export class RegulateurRateLimitingNotificationBullMq {
  private readonly emissionsParCle = new Map<string, EmissionRateLimitingBullMq[]>();

  /** Ce constructeur relie le regulateur au client Redis partage et fixe la fenetre glissante. */
  constructor(
    private readonly clientRedisShared: ClientRedisShared = FabriqueConnexionRedisShared.obtenirClient(),
    private readonly fenetreMs = 60_000,
  ) {}

  /** Cette methode controle si une emission reste autorisee dans la fenetre glissante. */
  public async consommer(
    cle: CleThrottlingNotification,
    limite: number,
  ): Promise<ResultatThrottlingNotification> {
    const cleTechnique = this.construireCleTechnique(cle);
    const cleRedis = this.construireCleRedis(cleTechnique);
    const maintenant = Date.now();
    const emissions = await this.nettoyerEtLire(cleRedis, cleTechnique, maintenant);

    emissions.push({ horodatage: maintenant });
    this.emissionsParCle.set(cleTechnique, emissions);
    await this.clientRedisShared.ecrireJson(
      cleRedis,
      emissions.map((emission) => emission.horodatage),
      Math.max(1, Math.ceil(this.fenetreMs / 1000)),
    );

    const etat = {
      cle: cleTechnique,
      compteur: emissions.length,
      limite,
      fenetreDebutLe: new Date(maintenant - this.fenetreMs),
      fenetreExpireLe: new Date(maintenant + this.fenetreMs),
    };

    if (emissions.length > limite) {
      return {
        autorise: false,
        raison: 'La frequence des emissions depasse la fenetre glissante BullMQ autorisee.',
        controleLe: new Date(maintenant),
        etat,
      };
    }

    return {
      autorise: true,
      controleLe: new Date(maintenant),
      etat,
    };
  }

  /** Cette methode retourne le volume courant d emissions sur une cle donnee. */
  public async observer(cle: CleThrottlingNotification): Promise<number> {
    const cleTechnique = this.construireCleTechnique(cle);
    const emissions = await this.nettoyerEtLire(
      this.construireCleRedis(cleTechnique),
      cleTechnique,
      Date.now(),
    );
    return emissions.length;
  }

  /** Cette methode nettoie les emissions trop anciennes depuis le miroir local ou Redis. */
  private async nettoyerEtLire(
    cleRedis: string,
    cleTechnique: string,
    maintenant: number,
  ): Promise<EmissionRateLimitingBullMq[]> {
    const minimum = maintenant - this.fenetreMs;
    const miroirLocal = this.emissionsParCle.get(cleTechnique);

    if (miroirLocal) {
      const nettoyees = miroirLocal.filter((emission) => emission.horodatage >= minimum);
      this.emissionsParCle.set(cleTechnique, nettoyees);
      return nettoyees;
    }

    const brut = await this.clientRedisShared.lireJson<readonly number[]>(cleRedis);
    const nettoyees = (brut ?? [])
      .filter((horodatage) => typeof horodatage === 'number' && horodatage >= minimum)
      .map((horodatage) => ({ horodatage }));
    this.emissionsParCle.set(cleTechnique, nettoyees);
    return nettoyees;
  }

  /** Cette methode construit la cle technique stable du rate limiting. */
  private construireCleTechnique(cle: CleThrottlingNotification): string {
    return [
      cle.identifiant,
      cle.organisationId ?? '*',
      cle.ecoleId ?? '*',
      cle.canal ?? '*',
      cle.typeWorker ?? '*',
    ].join('::');
  }

  /** Cette methode construit la cle Redis du rate limiting BullMQ. */
  private construireCleRedis(cleTechnique: string): string {
    return `notifications:rate-limit:${cleTechnique}`;
  }
}
