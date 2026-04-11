import { AnneeScolaireSortie } from '../dto/output/AnneeScolaireSortie';
import { ClassePedagogiqueSortie } from '../dto/output/ClassePedagogiqueSortie';
import { EcoleSortie } from '../dto/output/EcoleSortie';
import { ProgrammeNiveauSortie } from '../dto/output/ProgrammeNiveauSortie';
import { ReferentielProgrammeSortie } from '../dto/output/ReferentielProgrammeSortie';
import { VersionReferentielProgrammeSortie } from '../dto/output/VersionReferentielProgrammeSortie';
import { ErreurUseCaseInvalide } from '../exceptions/ErreurUseCaseInvalide';
import { OrchestrateurSynchronisationReferentiel } from '../services/OrchestrateurSynchronisationReferentiel';
import { SortieComparerDeuxVersionsReferentiel } from '../use-cases/referentiels/ComparerDeuxVersionsReferentiel';

// Cette interface represente l'etat de version locale et distante pour une classe academique.
export interface VersionSynchronisationClasseSagaMigrationOfflineVersSync {
  idClasseAcademique: string;
  versionReferentielLocale: string;
  versionReferentielServeur: string;
}

// Cette interface represente le resultat de l'analyse locale de l'ecole avant migration.
export interface AnalyseEcoleLocaleSagaMigrationOfflineVersSync {
  ecole: EcoleSortie;
  anneesScolaires: readonly AnneeScolaireSortie[];
  classesPedagogiques: readonly ClassePedagogiqueSortie[];
  programmesLocaux: readonly ProgrammeNiveauSortie[];
  versionsReferentielParClasse: readonly VersionSynchronisationClasseSagaMigrationOfflineVersSync[];
}

// Cette interface represente les referentiels globaux charges depuis le serveur.
export interface ReferentielsGlobauxServeurSagaMigrationOfflineVersSync {
  referentielsProgrammes: readonly ReferentielProgrammeSortie[];
  versionsReferentielProgrammes: readonly VersionReferentielProgrammeSortie[];
}

// Cette interface represente le resultat de la reconciliation des structures entre le local et le serveur.
export interface SortieReconciliationStructuresSagaMigrationOfflineVersSync {
  totalStructuresReconciliees: number;
  elementsReconcilies: readonly string[];
}

// Cette interface definit la dependance d'analyse de l'ecole locale.
export interface AnalyseurEcoleLocaleSagaMigrationOfflineVersSync {
  // Cette methode analyse l'etat local de l'ecole avant la bascule vers le mode synchronise.
  analyserEcoleLocale(idEcole: string): Promise<AnalyseEcoleLocaleSagaMigrationOfflineVersSync | null>;
}

// Cette interface definit la dependance de chargement des referentiels globaux du serveur.
export interface ChargeurReferentielsGlobauxServeurSagaMigrationOfflineVersSync {
  // Cette methode charge les referentiels globaux du serveur utiles a la migration.
  chargerReferentielsGlobauxServeur(
    idEcole: string,
  ): Promise<ReferentielsGlobauxServeurSagaMigrationOfflineVersSync>;
}

// Cette interface definit la dependance de reconciliation des structures.
export interface ReconciliateurStructuresSagaMigrationOfflineVersSync {
  // Cette methode reconcilie les structures locales avec les structures globales du serveur.
  reconcilierStructures(
    analyseEcoleLocale: AnalyseEcoleLocaleSagaMigrationOfflineVersSync,
    referentielsGlobauxServeur: ReferentielsGlobauxServeurSagaMigrationOfflineVersSync,
    comparaisonsVersions: readonly SortieComparerDeuxVersionsReferentiel[],
  ): Promise<SortieReconciliationStructuresSagaMigrationOfflineVersSync>;
}

// Cette interface definit la dependance de poussee des annees scolaires.
export interface PousseurAnneesScolairesSagaMigrationOfflineVersSync {
  // Cette methode pousse les annees scolaires locales vers le systeme synchronise.
  pousserAnneesScolaires(anneesScolaires: readonly AnneeScolaireSortie[]): Promise<number>;
}

// Cette interface definit la dependance de poussee des classes pedagogiques.
export interface PousseurClassesPedagogiquesSagaMigrationOfflineVersSync {
  // Cette methode pousse les classes pedagogiques locales vers le systeme synchronise.
  pousserClassesPedagogiques(
    classesPedagogiques: readonly ClassePedagogiqueSortie[],
  ): Promise<number>;
}

// Cette interface definit la dependance de poussee des programmes locaux.
export interface PousseurProgrammesLocauxSagaMigrationOfflineVersSync {
  // Cette methode pousse les programmes locaux vers le systeme synchronise.
  pousserProgrammesLocaux(programmesLocaux: readonly ProgrammeNiveauSortie[]): Promise<number>;
}

// Cette interface represente les donnees journalisees a la fin de la migration offline vers sync.
export interface JournalMigrationOfflineVersSyncSagaMigrationOfflineVersSync {
  idEcole: string;
  declenchePar: string;
  totalComparaisons: number;
  totalStructuresReconciliees: number;
  totalAnneesPoussees: number;
  totalClassesPedagogiquesPoussees: number;
  totalProgrammesLocauxPousses: number;
}

// Cette interface definit la dependance de journalisation de la migration offline vers sync.
export interface JournaliseurSagaMigrationOfflineVersSync {
  // Cette methode journalise le bilan de migration du mode offline vers le mode sync.
  journaliserMigration(
    journalMigration: JournalMigrationOfflineVersSyncSagaMigrationOfflineVersSync,
  ): Promise<void>;
}

// Cette interface represente l'entree de la saga de migration offline vers sync.
export interface EntreeSagaMigrationOfflineVersSync {
  idEcole: string;
  declenchePar: string;
}

// Cette interface represente la sortie de la saga de migration offline vers sync.
export interface SortieSagaMigrationOfflineVersSync {
  analyseEcoleLocale: AnalyseEcoleLocaleSagaMigrationOfflineVersSync;
  referentielsGlobauxServeur: ReferentielsGlobauxServeurSagaMigrationOfflineVersSync;
  comparaisonsVersions: readonly SortieComparerDeuxVersionsReferentiel[];
  reconciliationStructures: SortieReconciliationStructuresSagaMigrationOfflineVersSync;
  totalAnneesPoussees: number;
  totalClassesPedagogiquesPoussees: number;
  totalProgrammesLocauxPousses: number;
  migrationJournalisee: boolean;
}

// Cette saga orchestre le workflow de migration d'une ecole du mode offline vers le mode synchronise.
export class SagaMigrationOfflineVersSync {
  private readonly analyseurEcoleLocale: AnalyseurEcoleLocaleSagaMigrationOfflineVersSync;
  private readonly chargeurReferentielsGlobauxServeur: ChargeurReferentielsGlobauxServeurSagaMigrationOfflineVersSync;
  private readonly reconciliateurStructures: ReconciliateurStructuresSagaMigrationOfflineVersSync;
  private readonly pousseurAnneesScolaires: PousseurAnneesScolairesSagaMigrationOfflineVersSync;
  private readonly pousseurClassesPedagogiques: PousseurClassesPedagogiquesSagaMigrationOfflineVersSync;
  private readonly pousseurProgrammesLocaux: PousseurProgrammesLocauxSagaMigrationOfflineVersSync;
  private readonly journaliseurSagaMigrationOfflineVersSync: JournaliseurSagaMigrationOfflineVersSync;
  private readonly orchestrateurSynchronisationReferentiel: OrchestrateurSynchronisationReferentiel;

  // Ce constructeur injecte les dependances du workflow de migration offline vers sync.
  constructor(
    analyseurEcoleLocale: AnalyseurEcoleLocaleSagaMigrationOfflineVersSync,
    chargeurReferentielsGlobauxServeur: ChargeurReferentielsGlobauxServeurSagaMigrationOfflineVersSync,
    reconciliateurStructures: ReconciliateurStructuresSagaMigrationOfflineVersSync,
    pousseurAnneesScolaires: PousseurAnneesScolairesSagaMigrationOfflineVersSync,
    pousseurClassesPedagogiques: PousseurClassesPedagogiquesSagaMigrationOfflineVersSync,
    pousseurProgrammesLocaux: PousseurProgrammesLocauxSagaMigrationOfflineVersSync,
    journaliseurSagaMigrationOfflineVersSync: JournaliseurSagaMigrationOfflineVersSync,
    orchestrateurSynchronisationReferentiel: OrchestrateurSynchronisationReferentiel,
  ) {
    this.analyseurEcoleLocale = analyseurEcoleLocale;
    this.chargeurReferentielsGlobauxServeur = chargeurReferentielsGlobauxServeur;
    this.reconciliateurStructures = reconciliateurStructures;
    this.pousseurAnneesScolaires = pousseurAnneesScolaires;
    this.pousseurClassesPedagogiques = pousseurClassesPedagogiques;
    this.pousseurProgrammesLocaux = pousseurProgrammesLocaux;
    this.journaliseurSagaMigrationOfflineVersSync = journaliseurSagaMigrationOfflineVersSync;
    this.orchestrateurSynchronisationReferentiel = orchestrateurSynchronisationReferentiel;
  }

  // Cette methode execute les etapes documentaires completes de la migration offline vers sync.
  public async executer(
    entree: EntreeSagaMigrationOfflineVersSync,
  ): Promise<SortieSagaMigrationOfflineVersSync> {
    const entreeValidee = this.validerEntree(entree);
    const analyseEcoleLocale = await this.analyseurEcoleLocale.analyserEcoleLocale(
      entreeValidee.idEcole,
    );

    if (analyseEcoleLocale === null) {
      throw new ErreurUseCaseInvalide(
        "L'analyse locale de l'ecole a migrer est introuvable.",
      );
    }

    if (analyseEcoleLocale.ecole.id !== entreeValidee.idEcole) {
      throw new ErreurUseCaseInvalide(
        "L'analyse locale chargee n'est pas coherente avec l'ecole cible de la migration.",
      );
    }

    const referentielsGlobauxServeur = await this.chargeurReferentielsGlobauxServeur
      .chargerReferentielsGlobauxServeur(entreeValidee.idEcole);
    const comparaisonsVersions = await this.comparerVersionsReferentiel(
      analyseEcoleLocale.versionsReferentielParClasse,
    );
    const reconciliationStructures = await this.reconciliateurStructures.reconcilierStructures(
      analyseEcoleLocale,
      referentielsGlobauxServeur,
      comparaisonsVersions,
    );
    const totalAnneesPoussees = await this.pousseurAnneesScolaires.pousserAnneesScolaires(
      analyseEcoleLocale.anneesScolaires,
    );
    const totalClassesPedagogiquesPoussees = await this.pousseurClassesPedagogiques
      .pousserClassesPedagogiques(analyseEcoleLocale.classesPedagogiques);
    const totalProgrammesLocauxPousses = await this.pousseurProgrammesLocaux.pousserProgrammesLocaux(
      analyseEcoleLocale.programmesLocaux,
    );

    await this.journaliseurSagaMigrationOfflineVersSync.journaliserMigration({
      idEcole: entreeValidee.idEcole,
      declenchePar: entreeValidee.declenchePar,
      totalComparaisons: comparaisonsVersions.length,
      totalStructuresReconciliees: reconciliationStructures.totalStructuresReconciliees,
      totalAnneesPoussees,
      totalClassesPedagogiquesPoussees,
      totalProgrammesLocauxPousses,
    });

    return {
      analyseEcoleLocale,
      referentielsGlobauxServeur,
      comparaisonsVersions,
      reconciliationStructures,
      totalAnneesPoussees,
      totalClassesPedagogiquesPoussees,
      totalProgrammesLocauxPousses,
      migrationJournalisee: true,
    };
  }

  // Cette methode compare les versions locales et serveur pour chaque classe academique analysee.
  private comparerVersionsReferentiel(
    versionsReferentielParClasse: readonly VersionSynchronisationClasseSagaMigrationOfflineVersSync[],
  ): Promise<SortieComparerDeuxVersionsReferentiel[]> {
    const versionsValidees = this.validerVersionsReferentielParClasse(versionsReferentielParClasse);

    return Promise.all(
      versionsValidees.map((versionSynchronisationClasse) =>
        this.orchestrateurSynchronisationReferentiel.comparerDeuxVersionsReferentiel({
          idClasseAcademique: versionSynchronisationClasse.idClasseAcademique,
          versionReferentielSource: versionSynchronisationClasse.versionReferentielLocale,
          versionReferentielCible: versionSynchronisationClasse.versionReferentielServeur,
        })),
    );
  }

  // Cette methode valide l'entree de la saga et normalise les textes attendus.
  private validerEntree(
    entree: EntreeSagaMigrationOfflineVersSync,
  ): EntreeSagaMigrationOfflineVersSync {
    if (entree === null || entree === undefined) {
      throw new ErreurUseCaseInvalide(
        "L'entree de la saga de migration offline vers sync est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      declenchePar: this.validerTexteObligatoire(entree.declenchePar, 'declenchePar'),
    };
  }

  // Cette methode valide la liste des versions a comparer pour les classes academiques de l'ecole.
  private validerVersionsReferentielParClasse(
    versionsReferentielParClasse: readonly VersionSynchronisationClasseSagaMigrationOfflineVersSync[],
  ): readonly VersionSynchronisationClasseSagaMigrationOfflineVersSync[] {
    if (!Array.isArray(versionsReferentielParClasse)) {
      throw new ErreurUseCaseInvalide(
        'Les versions de referentiel par classe doivent etre fournies sous forme de liste.',
      );
    }

    return versionsReferentielParClasse.map((versionSynchronisationClasse, indexVersion) => ({
      idClasseAcademique: this.validerTexteObligatoire(
        versionSynchronisationClasse.idClasseAcademique,
        `versionsReferentielParClasse[${indexVersion}].idClasseAcademique`,
      ),
      versionReferentielLocale: this.validerTexteObligatoire(
        versionSynchronisationClasse.versionReferentielLocale,
        `versionsReferentielParClasse[${indexVersion}].versionReferentielLocale`,
      ),
      versionReferentielServeur: this.validerTexteObligatoire(
        versionSynchronisationClasse.versionReferentielServeur,
        `versionsReferentielParClasse[${indexVersion}].versionReferentielServeur`,
      ),
    }));
  }

  // Cette methode valide un champ textuel obligatoire utilise pendant le workflow.
  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurUseCaseInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }
}
