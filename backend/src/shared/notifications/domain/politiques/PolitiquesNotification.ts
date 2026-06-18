import { CriticiteLivraison, ExigenceAudit, ExigenceMonitoring, TypePolitiqueExpiration, TypePolitiqueRetry } from '../enumerations';

/** Cette classe porte la politique metier de retry. */
export class PolitiqueRetry {
  constructor(
    public readonly type: TypePolitiqueRetry,
    private readonly maximumRetry: number,
    public readonly delaiRetryMs: number,
  ) {}

  /** Cette methode expose le maximum de retries autorises. */
  public obtenirMaximumRetry(): number { return this.maximumRetry; }
}

/** Cette classe porte la politique metier d'expiration. */
export class PolitiqueExpiration {
  constructor(
    public readonly type: TypePolitiqueExpiration,
    private readonly expireLe?: Date,
  ) {}

  /** Cette methode indique si la notification est deja expiree a une date donnee. */
  public estExpiree(aLaDate: Date): boolean {
    return this.expireLe !== undefined && aLaDate.getTime() >= this.expireLe.getTime();
  }
}

/** Cette classe porte la politique de quotas metier. */
export class PolitiqueQuotasNotification { constructor(public readonly limites: Record<string, number> = {}) {} }

/** Cette classe porte la politique budgetaire des canaux couteux. */
export class PolitiqueBudgetNotification { constructor(public readonly budgetSms?: number) {} }

/** Cette classe porte la politique de throttling runtime applicable cote metier. */
export class PolitiqueThrottling { constructor(public readonly limites: Record<string, number> = {}) {} }

/** Cette classe porte la politique anti-spam et anti-fatigue de communication. */
export class PolitiqueAntiSpam { constructor(public readonly cooldownMs?: number) {} }

/** Cette classe porte la gouvernance des livraisons sensibles ou massives. */
export class PolitiqueGouvernanceLivraison { constructor(public readonly approbationRequise: boolean) {} }

/** Cette classe porte les regles de securite de la notification. */
export class PolitiqueSecuriteNotification { constructor(public readonly crossTenantInterdit = true) {} }

/** Cette classe porte le comportement attendu en contexte offline-first. */
export class PolitiqueOfflineNotification {
  constructor(public readonly comportement: 'IGNORABLE' | 'DELAYABLE' | 'MUST_SYNC' | 'MUST_CONFIRM') {}
}

/** Cette classe porte la reaction metier attendue en cas de panne fournisseur. */
export class PolitiquePanneFournisseur {
  constructor(public readonly autoriseFallback: boolean, public readonly autoriseRetry: boolean) {}
}

/** Cette classe porte l'exigence d'audit associee a la notification. */
export class PolitiqueAuditNotification { constructor(public readonly exigence: ExigenceAudit) {} }

/** Cette classe porte l'exigence de monitoring associee a la notification. */
export class PolitiqueMonitoringNotification {
  constructor(public readonly exigence: ExigenceMonitoring, public readonly criticite: CriticiteLivraison) {}
}

/** Cette classe porte les interdictions de contenu sensible dans les messages rendus. */
export class PolitiqueSecuriteContenu {
  constructor(
    private readonly tokensInterdits: string[] = ['password', 'refresh', 'jwt', 'secret', 'apiKey', 'stackTrace'],
  ) {}

  /** Cette methode expose la liste des tokens interdits dans le contenu. */
  public obtenirTokensInterdits(): string[] { return [...this.tokensInterdits]; }
}
