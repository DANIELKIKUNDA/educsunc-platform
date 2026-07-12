import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  type Configuration,
  CreateConfigurationUseCase,
  type CreateConfigurationCommand,
  type NiveauConfiguration,
  type PorteeConfigurationProps,
  TYPES_MODULE_CONFIGURATION,
} from '../../shared/configuration';

export interface ConfigurationInitialeInventaireItem {
  readonly key: string;
  readonly libelleMetier: string;
  readonly scope: NiveauConfiguration;
  readonly typeValeur: 'liste' | 'booleen' | 'nombre' | 'texte' | 'aucun';
  readonly valeurInitiale: unknown;
  readonly source: string;
  readonly obligatoire: boolean;
  readonly momentInitialisation:
    | 'BOOTSTRAP_SYSTEME'
    | 'CREATION_ORGANISATION'
    | 'CREATION_ECOLE'
    | 'PREMIERE_UTILISATION'
    | 'AUCUN_DEFAUT_OFFICIEL';
}

interface JournalInitialisationConfigurationEntry {
  readonly executionId: string;
  readonly executedAt: string;
  readonly type: string;
  readonly scope: PorteeConfigurationProps;
  readonly createdKeys: readonly string[];
  readonly skippedKeys: readonly string[];
}

const ACTEUR_SYSTEME_CONFIGURATION = 'SYSTEM_CONFIGURATION_BOOTSTRAP';
const CHEMIN_JOURNAL_PAR_DEFAUT = path.resolve(
  process.cwd(),
  'stockage-local/configuration/bootstrap-journal.json',
);

const INVENTAIRE_CONFIGURATIONS_INITIALES: readonly ConfigurationInitialeInventaireItem[] = [
  {
    key: 'runtime.retry.maxAttempts',
    libelleMetier: 'Tentatives maximales de reprise plateforme',
    scope: 'SYSTEM',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "ConfigurationKeys.ts reference la cle, mais aucun defaut persiste officiel n'est prouve dans le domaine courant.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
  {
    key: 'runtime.replay.enabled',
    libelleMetier: 'Relecture automatique plateforme',
    scope: 'SYSTEM',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "ConfigurationKeys.ts reference la cle, mais aucun defaut persiste officiel n'est prouve dans le domaine courant.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
  {
    key: 'runtime.cache.ttlSeconds',
    libelleMetier: 'Duree de cache plateforme',
    scope: 'SYSTEM',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "ConfigurationKeys.ts reference la cle, mais aucun defaut persiste officiel n'est prouve dans le domaine courant.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
  {
    key: 'modules.allowed',
    libelleMetier: 'Modules autorises pour une organisation',
    scope: 'ORGANIZATION',
    typeValeur: 'liste',
    valeurInitiale: [...TYPES_MODULE_CONFIGURATION],
    source:
      "La resolution modulaire existante traite deja l'absence de modules.allowed comme catalogue complet autorisable.",
    obligatoire: true,
    momentInitialisation: 'CREATION_ORGANISATION',
  },
  {
    key: 'modules.enabled',
    libelleMetier: 'Modules actives dans une ecole',
    scope: 'SCHOOL',
    typeValeur: 'liste',
    valeurInitiale: [],
    source:
      "La doctrine officielle interdit toute activation automatique; l'ecole doit activer explicitement ses modules autorises.",
    obligatoire: true,
    momentInitialisation: 'CREATION_ECOLE',
  },
  {
    key: 'branding.logo.primary',
    libelleMetier: 'Logo principal de l ecole',
    scope: 'SCHOOL',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "La cle officielle existe, mais aucun asset documentaire initial obligatoire n'est prouve pour toutes les ecoles.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
  {
    key: 'notifications.templates.default',
    libelleMetier: 'Template principal de notification',
    scope: 'SCHOOL',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "La cle officielle existe, mais aucun template persiste initial obligatoire n'est prouve dans le module Configuration.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
  {
    key: 'preferences.theme',
    libelleMetier: 'Theme personnel de l utilisateur',
    scope: 'USER',
    typeValeur: 'aucun',
    valeurInitiale: null,
    source:
      "La famille utilisateur existe, mais aucune preference persistee par defaut n'est officiellement prouvee cote backend.",
    obligatoire: false,
    momentInitialisation: 'AUCUN_DEFAUT_OFFICIEL',
  },
] as const;

/** Cette classe industrialise l amorcage officiel des configurations initiales sans ecrasement. */
export class ConfigurationInitialisationOfficielleService {
  constructor(
    private readonly createConfigurationUseCase: CreateConfigurationUseCase,
    private readonly listerConfigurations: () => readonly Configuration[],
    private readonly cheminJournal = CHEMIN_JOURNAL_PAR_DEFAUT,
  ) {}

  /** Cette methode retourne l inventaire officiel des cles candidates. */
  public inventorier(): readonly ConfigurationInitialeInventaireItem[] {
    return INVENTAIRE_CONFIGURATIONS_INITIALES;
  }

  /** Cette methode amorce les reglages SYSTEM officiellement prouvables. */
  public async amorcerSysteme(): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    const resultat = { createdKeys: [] as string[], skippedKeys: [] as string[] };
    await this.journaliser({
      type: 'BOOTSTRAP_SYSTEME',
      scope: { niveau: 'SYSTEM' },
      createdKeys: resultat.createdKeys,
      skippedKeys: resultat.skippedKeys,
    });
    return resultat;
  }

  /** Cette methode initialise les reglages officiels d une organisation donnee. */
  public async amorcerOrganisation(params: {
    readonly organisationId: string;
    readonly actorId?: string;
  }): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    const resultat = { createdKeys: [] as string[], skippedKeys: [] as string[] };

    await this.creerSiAbsent(
      {
        key: 'modules.allowed',
        value: [...TYPES_MODULE_CONFIGURATION],
        scope: {
          niveau: 'ORGANIZATION',
          organisationId: params.organisationId,
        },
        actorId: params.actorId,
        metadata: {
          sourceInitialisation: 'OFFICIAL_CONFIGURATION_BOOTSTRAP',
          niveauInitialisation: 'ORGANIZATION',
          natureInitialisation: 'MODULES_ALLOWED_DEFAULT',
        },
        gouvernance: {
          proprietaireNiveau: 'ORGANIZATION',
          heritable: true,
          overridable: false,
          visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
          auditRequis: true,
          restartRequis: false,
        },
      },
      resultat,
    );

    await this.journaliser({
      type: 'CREATION_ORGANISATION',
      scope: {
        niveau: 'ORGANIZATION',
        organisationId: params.organisationId,
      },
      createdKeys: resultat.createdKeys,
      skippedKeys: resultat.skippedKeys,
    });

    return resultat;
  }

  /** Cette methode initialise les reglages officiels d une ecole donnee. */
  public async amorcerEcole(params: {
    readonly organisationId: string;
    readonly ecoleId: string;
    readonly actorId?: string;
  }): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    const resultat = { createdKeys: [] as string[], skippedKeys: [] as string[] };

    await this.creerSiAbsent(
      {
        key: 'modules.enabled',
        value: [],
        scope: {
          niveau: 'SCHOOL',
          organisationId: params.organisationId,
          ecoleId: params.ecoleId,
        },
        actorId: params.actorId,
        metadata: {
          sourceInitialisation: 'OFFICIAL_CONFIGURATION_BOOTSTRAP',
          niveauInitialisation: 'SCHOOL',
          natureInitialisation: 'MODULES_ENABLED_EMPTY_DEFAULT',
        },
        gouvernance: {
          proprietaireNiveau: 'SCHOOL',
          heritable: false,
          overridable: false,
          visiblePour: ['SYSTEM', 'ORGANIZATION', 'SCHOOL'],
          auditRequis: true,
          restartRequis: false,
        },
      },
      resultat,
    );

    await this.journaliser({
      type: 'CREATION_ECOLE',
      scope: {
        niveau: 'SCHOOL',
        organisationId: params.organisationId,
        ecoleId: params.ecoleId,
      },
      createdKeys: resultat.createdKeys,
      skippedKeys: resultat.skippedKeys,
    });

    return resultat;
  }

  /** Cette methode respecte la doctrine actuelle: aucune preference utilisateur arbitraire n'est creee. */
  public async amorcerUtilisateur(params: {
    readonly organisationId: string;
    readonly ecoleId: string;
    readonly utilisateurId: string;
  }): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    const resultat = { createdKeys: [] as string[], skippedKeys: [] as string[] };
    await this.journaliser({
      type: 'PREMIERE_UTILISATION',
      scope: {
        niveau: 'USER',
        organisationId: params.organisationId,
        ecoleId: params.ecoleId,
        utilisateurId: params.utilisateurId,
      },
      createdKeys: resultat.createdKeys,
      skippedKeys: resultat.skippedKeys,
    });
    return resultat;
  }

  private async creerSiAbsent(
    commande: CreateConfigurationCommand,
    resultat: { createdKeys: string[]; skippedKeys: string[] },
  ): Promise<void> {
    const existeDeja = this.listerConfigurations().some((configuration) => {
      const details = configuration.details();
      return (
        details.key === commande.key
        && details.scope.niveau === commande.scope.niveau
        && details.scope.organisationId === commande.scope.organisationId
        && details.scope.ecoleId === commande.scope.ecoleId
        && details.scope.utilisateurId === commande.scope.utilisateurId
      );
    });

    if (existeDeja) {
      resultat.skippedKeys.push(commande.key);
      return;
    }

    await this.createConfigurationUseCase.executer({
      ...commande,
      configurationId: commande.configurationId ?? randomUUID(),
      actorId: commande.actorId ?? ACTEUR_SYSTEME_CONFIGURATION,
    });
    resultat.createdKeys.push(commande.key);
  }

  private async journaliser(
    entry: Omit<JournalInitialisationConfigurationEntry, 'executionId' | 'executedAt'>,
  ): Promise<void> {
    const existantes = this.lireJournal();
    const prochaine = [
      ...existantes,
      {
        executionId: randomUUID(),
        executedAt: new Date().toISOString(),
        ...entry,
      },
    ];
    const dossier = path.dirname(this.cheminJournal);
    mkdirSync(dossier, { recursive: true });
    writeFileSync(this.cheminJournal, JSON.stringify(prochaine, null, 2), 'utf8');
  }

  private lireJournal(): readonly JournalInitialisationConfigurationEntry[] {
    if (!existsSync(this.cheminJournal)) {
      return [];
    }

    const contenu = readFileSync(this.cheminJournal, 'utf8').trim();
    if (contenu.length === 0) {
      return [];
    }

    return JSON.parse(contenu) as JournalInitialisationConfigurationEntry[];
  }
}
