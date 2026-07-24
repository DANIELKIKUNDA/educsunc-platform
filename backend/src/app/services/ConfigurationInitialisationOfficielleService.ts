import { randomUUID } from 'node:crypto';
import path from 'node:path';

import {
  CATALOGUE_CONFIGURATION_OFFICIELLE,
  type Configuration,
  ConfigurationBootstrapJournalStoreFichier,
  CreateConfigurationUseCase,
  type CreateConfigurationCommand,
  type NiveauConfiguration,
  type JournalInitialisationConfigurationEntry,
  type ConfigurationBootstrapJournalStore,
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

const ACTEUR_SYSTEME_CONFIGURATION = 'SYSTEM_CONFIGURATION_BOOTSTRAP';
const CHEMIN_JOURNAL_PAR_DEFAUT = path.resolve(
  process.cwd(),
  'stockage-local/configuration/bootstrap-journal.json',
);

const INVENTAIRE_CONFIGURATIONS_INITIALES: readonly ConfigurationInitialeInventaireItem[] =
  CATALOGUE_CONFIGURATION_OFFICIELLE.map((definition) => ({
    key: definition.key,
    libelleMetier: definition.libelleMetier,
    scope: definition.scope,
    typeValeur: definition.typeValeur === 'enum'
      ? 'texte'
      : definition.typeValeur === 'duree-secondes' || definition.typeValeur === 'duree-millisecondes'
        ? 'nombre'
        : definition.typeValeur === 'entier'
          ? 'nombre'
          : definition.typeValeur === 'booleen'
            ? 'booleen'
            : definition.typeValeur === 'liste'
              ? 'liste'
              : 'texte',
    valeurInitiale: definition.valeurParDefaut,
    source: definition.preuve,
    obligatoire: definition.obligatoire,
    momentInitialisation: definition.momentInitialisation,
  }));

/** Cette classe industrialise l amorcage officiel des configurations initiales sans ecrasement. */
export class ConfigurationInitialisationOfficielleService {
  private readonly journalStore: ConfigurationBootstrapJournalStore;

  constructor(
    private readonly createConfigurationUseCase: CreateConfigurationUseCase,
    private readonly listerConfigurations: () => Promise<readonly Configuration[]> | readonly Configuration[],
    cheminJournal = CHEMIN_JOURNAL_PAR_DEFAUT,
    journalStore?: ConfigurationBootstrapJournalStore,
  ) {
    this.journalStore = journalStore ?? new ConfigurationBootstrapJournalStoreFichier(cheminJournal);
  }

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
    for (const definition of CATALOGUE_CONFIGURATION_OFFICIELLE.filter(
      (entry) => entry.momentInitialisation === 'BOOTSTRAP_SYSTEME',
    )) {
      await this.creerSiAbsent(
        {
          key: definition.key,
          value: definition.valeurParDefaut as CreateConfigurationCommand['value'],
          scope: { niveau: 'SYSTEM' },
          actorId: ACTEUR_SYSTEME_CONFIGURATION,
          metadata: {
            sourceInitialisation: 'OFFICIAL_CONFIGURATION_BOOTSTRAP',
            niveauInitialisation: 'SYSTEM',
            natureInitialisation: 'SYSTEM_DEFAULT',
            moteurConsommateur: definition.moteurConsommateur,
          },
        },
        resultat,
      );
    }

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

  /** Cette methode initialise les preferences officielles du premier usage sans ecrasement. */
  public async amorcerUtilisateur(params: {
    readonly organisationId?: string;
    readonly ecoleId?: string;
    readonly utilisateurId: string;
  }): Promise<{
    readonly createdKeys: readonly string[];
    readonly skippedKeys: readonly string[];
  }> {
    const resultat = { createdKeys: [] as string[], skippedKeys: [] as string[] };

    for (const definition of CATALOGUE_CONFIGURATION_OFFICIELLE.filter(
      (entry) => entry.momentInitialisation === 'PREMIERE_UTILISATION',
    )) {
      await this.creerSiAbsent(
        {
          key: definition.key,
          value: definition.valeurParDefaut as CreateConfigurationCommand['value'],
          scope: {
            niveau: 'USER',
            utilisateurId: params.utilisateurId,
          },
          actorId: params.utilisateurId,
          metadata: {
            sourceInitialisation: 'OFFICIAL_CONFIGURATION_BOOTSTRAP',
            niveauInitialisation: 'USER',
            natureInitialisation: 'USER_DEFAULT',
            moteurConsommateur: definition.moteurConsommateur,
          },
        },
        resultat,
      );
    }

    await this.journaliser({
      type: 'PREMIERE_UTILISATION',
      scope: {
        niveau: 'USER',
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
    if (await this.configurationExiste(commande)) {
      resultat.skippedKeys.push(commande.key);
      return;
    }

    try {
      await this.createConfigurationUseCase.executer({
        ...commande,
        configurationId: commande.configurationId ?? randomUUID(),
        actorId: commande.actorId ?? ACTEUR_SYSTEME_CONFIGURATION,
      });
    } catch (erreur) {
      // Un premier usage concurrent peut avoir cree la meme valeur entre la lecture et l'insertion.
      if (await this.configurationExiste(commande)) {
        resultat.skippedKeys.push(commande.key);
        return;
      }
      throw erreur;
    }
    resultat.createdKeys.push(commande.key);
  }

  private async configurationExiste(commande: CreateConfigurationCommand): Promise<boolean> {
    const configurations = await this.listerConfigurations();
    return configurations.some((configuration) => {
      const details = configuration.details();
      if (
        details.key !== commande.key
        || details.scope.niveau !== commande.scope.niveau
      ) {
        return false;
      }

      if (commande.scope.niveau === 'USER') {
        return details.scope.utilisateurId === commande.scope.utilisateurId;
      }

      return (
        details.scope.organisationId === commande.scope.organisationId
        && details.scope.ecoleId === commande.scope.ecoleId
        && details.scope.utilisateurId === commande.scope.utilisateurId
      );
    });
  }

  private async journaliser(
    entry: Omit<JournalInitialisationConfigurationEntry, 'executionId' | 'executedAt'>,
  ): Promise<void> {
    await this.journalStore.journaliser({
      executionId: randomUUID(),
      executedAt: new Date().toISOString(),
      ...entry,
    });
  }
}
