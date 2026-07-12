import {
  ConfigurationChange,
  ConfigurationLock,
  ConfigurationOverride,
} from '../entities';
import {
  ConfigurationCreated,
  ConfigurationLocked,
  ConfigurationOverridden,
  ConfigurationSnapshotCreated,
  ConfigurationUnlocked,
  ConfigurationUpdated,
  ConfigurationValidated,
} from '../events';
import { StatutConfiguration } from '../enums';
import {
  ExceptionConfigurationIncoherente,
  ExceptionLockViolation,
  ExceptionOverrideInterdit,
} from '../exceptions';
import {
  PolitiqueLockConfiguration,
  PolitiqueOverrideConfiguration,
  PolitiqueValidationConfiguration,
} from '../policies';
import {
  ConfigurationId,
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
} from '../value-objects';
import { ConfigurationSnapshot } from './ConfigurationSnapshot';
import { ConfigurationVersion } from './ConfigurationVersion';

// Ce fichier declare l agregat racine du module Configuration.

/** Cette interface represente les metadonnees de gouvernance attachees a une cle. */
export interface GouvernanceConfigurationProps {
  readonly proprietaireNiveau: import('../enums').NiveauConfiguration;
  readonly heritable: boolean;
  readonly overridable: boolean;
  readonly visiblePour: readonly import('../enums').NiveauConfiguration[];
  readonly auditRequis: boolean;
  readonly restartRequis: boolean;
}

/** Cette classe represente la source de verite domaine pour une configuration gouvernee. */
export class Configuration {
  private readonly overrides: ConfigurationOverride[] = [];
  private readonly versions: ConfigurationVersion[] = [];
  private readonly changements: ConfigurationChange[] = [];
  private readonly evenements: object[] = [];
  private lock: ConfigurationLock | null = null;
  private totalVersionsHistorisees = 0;

  constructor(
    private readonly identifiant: ConfigurationId,
    private readonly scope: ConfigurationScope,
    private readonly key: ConfigurationKey,
    private valeurCourante: ConfigurationValue,
    private statut: StatutConfiguration = 'BROUILLON',
    private readonly creeLe: Date = new Date(),
    private readonly gouvernance: GouvernanceConfigurationProps = {
      proprietaireNiveau: scope.niveau(),
      heritable: true,
      overridable: true,
      visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL', 'USER'],
      auditRequis: true,
      restartRequis: false,
    },
  ) {
    this.evenements.push(
      new ConfigurationCreated({
        configurationId: identifiant,
        scope,
        createdAt: creeLe,
      }),
    );
  }

  /** Cette methode rehydrate un agregat depuis un etat de persistence fiable. */
  public static reconstituer(params: {
    readonly identifiant: string;
    readonly scope: ReturnType<ConfigurationScope['valeur']>;
    readonly key: string;
    readonly valeur: ReturnType<ConfigurationValue['valeur']>;
    readonly statut: StatutConfiguration;
    readonly creeLe: Date;
    readonly gouvernance: GouvernanceConfigurationProps;
    readonly overrides: readonly {
      readonly key: string;
      readonly scope: ReturnType<ConfigurationScope['valeur']>;
      readonly value: ReturnType<ConfigurationValue['valeur']>;
      readonly actorId: string;
      readonly raison?: string;
      readonly overrideLe: Date;
    }[];
    readonly lock: {
      readonly key: string;
      readonly niveauMinimalAutorise: import('../enums').NiveauConfiguration;
      readonly actorId: string;
      readonly raison?: string;
      readonly verrouilleLe: Date;
    } | null;
    readonly totalVersions: number;
  }): Configuration {
    const configuration = new Configuration(
      ConfigurationId.creer(params.identifiant),
      ConfigurationScope.creer(params.scope),
      ConfigurationKey.creer(params.key),
      ConfigurationValue.creer(params.valeur),
      params.statut,
      params.creeLe,
      params.gouvernance,
    );

    configuration.evenements.splice(0, configuration.evenements.length);
    configuration.totalVersionsHistorisees = params.totalVersions;
    configuration.overrides.push(
      ...params.overrides.map((override) => new ConfigurationOverride({
        key: ConfigurationKey.creer(override.key),
        scope: ConfigurationScope.creer(override.scope),
        value: ConfigurationValue.creer(override.value),
        actorId: override.actorId,
        raison: override.raison,
        overrideLe: override.overrideLe,
      })),
    );
    configuration.lock = params.lock
      ? new ConfigurationLock({
        key: ConfigurationKey.creer(params.lock.key),
        niveauMinimalAutorise: params.lock.niveauMinimalAutorise,
        actorId: params.lock.actorId,
        raison: params.lock.raison,
        verrouilleLe: params.lock.verrouilleLe,
      })
      : null;

    return configuration;
  }

  /** Cette methode met a jour la valeur racine de la configuration. */
  public mettreAJour(
    nouvelleValeur: ConfigurationValue,
    changement: ConfigurationChange,
    politiqueValidation = new PolitiqueValidationConfiguration(),
  ): readonly string[] {
    this.assurerModificationAutorisee(this.scope);
    this.valeurCourante = nouvelleValeur;
    this.statut = 'ACTIVE';
    this.changements.push(changement);

    const version = new ConfigurationVersion(
      this.identifiant,
      this.totalVersionsHistorisees + 1,
      nouvelleValeur,
      changement,
      changement.valeur().changedAt,
    );
    this.versions.push(version);
    this.totalVersionsHistorisees += 1;
    this.evenements.push(
      new ConfigurationUpdated({
        configurationId: this.identifiant,
        updatedAt: changement.valeur().changedAt,
        actorId: changement.valeur().actorId,
      }),
    );

    const warnings = politiqueValidation.valider(this.key, nouvelleValeur);
    this.evenements.push(
      new ConfigurationValidated({
        configurationId: this.identifiant,
        validatedAt: new Date(),
        warnings,
      }),
    );

    return warnings;
  }

  /** Cette methode applique une surcharge sur une portee inferieure compatible. */
  public appliquerOverride(
    override: ConfigurationOverride,
    politiqueOverride = new PolitiqueOverrideConfiguration(),
  ): void {
    if (!this.gouvernance.overridable) {
      throw new ExceptionOverrideInterdit('Cette cle de configuration interdit toute surcharge.');
    }

    const autorise = politiqueOverride.autoriser(
      this.scope,
      override.valeur().scope,
      this.lock !== null,
    );
    if (!autorise) {
      throw new ExceptionOverrideInterdit();
    }

    this.overrides.push(override);
    this.evenements.push(
      new ConfigurationOverridden({
        configurationId: this.identifiant,
        scope: override.valeur().scope,
        overriddenAt: override.valeur().overrideLe,
        actorId: override.valeur().actorId,
      }),
    );
  }

  /** Cette methode verrouille la configuration a partir d un niveau minimal. */
  public verrouiller(lock: ConfigurationLock): void {
    this.lock = lock;
    this.statut = 'LOCKED';
    this.evenements.push(
      new ConfigurationLocked({
        configurationId: this.identifiant,
        lockedAt: lock.valeur().verrouilleLe,
        actorId: lock.valeur().actorId,
      }),
    );
  }

  /** Cette methode retire le verrou courant si present. */
  public deverrouiller(actorId?: string): void {
    this.lock = null;
    this.statut = 'ACTIVE';
    this.evenements.push(
      new ConfigurationUnlocked({
        configurationId: this.identifiant,
        unlockedAt: new Date(),
        actorId,
      }),
    );
  }

  /** Cette methode cree un snapshot metier a partir d une liste de valeurs effectives. */
  public creerSnapshot(
    identifiantSnapshot: string,
    valeurs: readonly import('../value-objects').EffectiveValue[],
  ): ConfigurationSnapshot {
    const snapshot = new ConfigurationSnapshot(identifiantSnapshot, valeurs);
    this.evenements.push(
      new ConfigurationSnapshotCreated({
        configurationId: this.identifiant,
        snapshotId: identifiantSnapshot,
        createdAt: new Date(),
      }),
    );
    return snapshot;
  }

  /** Cette methode retourne un etat de lecture de l agregat. */
  public details(): {
    readonly identifiant: string;
    readonly scope: ReturnType<ConfigurationScope['valeur']>;
    readonly key: string;
    readonly valeur: ReturnType<ConfigurationValue['valeur']>;
    readonly statut: StatutConfiguration;
    readonly overrides: readonly ReturnType<ConfigurationOverride['valeur']>[];
    readonly lock: ReturnType<ConfigurationLock['valeur']> | null;
    readonly totalVersions: number;
    readonly creeLe: Date;
    readonly gouvernance: GouvernanceConfigurationProps;
  } {
    return {
      identifiant: this.identifiant.valeur(),
      scope: this.scope.valeur(),
      key: this.key.valeur(),
      valeur: this.valeurCourante.valeur(),
      statut: this.statut,
      overrides: this.overrides.map((override) => override.valeur()),
      lock: this.lock ? this.lock.valeur() : null,
      totalVersions: this.totalVersionsHistorisees,
      creeLe: this.creeLe,
      gouvernance: {
        ...this.gouvernance,
        visiblePour: [...this.gouvernance.visiblePour],
      },
    };
  }

  /** Cette methode indique si le parametre reste visible pour un niveau donne. */
  public estVisiblePour(niveau: import('../enums').NiveauConfiguration): boolean {
    return this.gouvernance.visiblePour.includes(niveau);
  }

  /** Cette methode retourne les evenements domaine emis depuis la derniere lecture. */
  public relacherEvenements(): readonly object[] {
    const copie = [...this.evenements];
    this.evenements.splice(0, this.evenements.length);
    return copie;
  }

  /** Cette methode retourne les versions historisees. */
  public versionsHistorisees(): readonly ConfigurationVersion[] {
    return [...this.versions];
  }

  /** Cette methode retourne les changements traces. */
  public changementsTraces(): readonly ReturnType<ConfigurationChange['valeur']>[] {
    return this.changements.map((changement) => changement.valeur());
  }

  /** Cette methode garantit qu une modification reste autorisee malgre un verrou. */
  private assurerModificationAutorisee(scopeModification: ConfigurationScope): void {
    const politiqueLock = new PolitiqueLockConfiguration();
    if (!politiqueLock.autoriserModification(this.lock, scopeModification)) {
      throw new ExceptionLockViolation();
    }

    if (this.key.valeur().trim().length === 0) {
      throw new ExceptionConfigurationIncoherente('Une configuration doit toujours porter une cle valide.');
    }

    if (!this.gouvernance.visiblePour.includes(scopeModification.niveau())) {
      throw new ExceptionConfigurationIncoherente(
        'Le niveau demande ne peut pas visualiser ni modifier cette configuration.',
      );
    }
  }
}
