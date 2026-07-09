import { ReferentielProgrammeSortie } from '../../../application/dto/output/ReferentielProgrammeSortie';
import { ReferentielCoursSortie } from '../../../application/dto/output/ReferentielCoursSortie';
import { VersionReferentielProgrammeSortie } from '../../../application/dto/output/VersionReferentielProgrammeSortie';
import { OrchestrateurImportReferentiel } from '../../../application/services/OrchestrateurImportReferentiel';
import {
  ActiverVersionReferentiel,
  AjouterLigneVersionReferentielProgramme,
  ComparerDeuxVersionsReferentiel,
  ConsulterReferentielProgramme,
  CreerVersionTravailReferentielDepuisVersion,
  ListerReferentielsCours,
  ListerReferentielsParClasseAcademique,
  ModifierLigneVersionReferentielProgramme,
  ModifierPonderationLigneVersionReferentielProgramme,
  PublierVersionReferentiel,
  ReordonnerLignesVersionReferentielProgramme,
  RetirerLigneVersionReferentielProgramme,
  SortieComparerDeuxVersionsReferentiel,
  SortieImporterClassesAcademiquesDepuisJson,
  SortieImporterCoursAcademiquesDepuisJson,
  SortieImporterLignesProgrammeDepuisJson,
  SortieImporterOptionsDepuisJson,
  SortieImporterProgrammesAcademiquesDepuisJson,
  SortieImporterSectionsDepuisJson,
  VerifierCoherenceVersionReferentielAvantPublication,
} from '../../../application/use-cases/referentiels';
import { VerificationCoherenceVersionReferentielSortie } from '../../../application/dto/output/VerificationCoherenceVersionReferentielSortie';
import { ValidateurReferentielImportHttp } from '../validators/referentiel-import.validator';
import type { RequestContext } from '../../../../../shared/context';
import { AutorisationPublicationReferentielAdapter } from '../../../../../app/adapters/AutorisationPublicationReferentielAdapter';
import { AutorisationActivationReferentielAdapter } from '../../../../../app/adapters/AutorisationActivationReferentielAdapter';
import { AutorisationImportReferentielAdapter } from '../../../../../app/adapters/AutorisationImportReferentielAdapter';
import { AutorisationComparaisonReferentielAdapter } from '../../../../../app/adapters/AutorisationComparaisonReferentielAdapter';
import { AutorisationLectureReferentielAdapter } from '../../../../../app/adapters/AutorisationLectureReferentielAdapter';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente une reponse HTTP simple a donnee unique.
export interface ReponseDonneeReferentielHttp<TDonnee> {
  donnee: TDonnee;
}

// Cette interface represente une reponse HTTP paginee de referentiels programmes.
export interface ReponseListeReferentielsProgrammesHttp {
  donnees: ReferentielProgrammeSortie[];
  pagination: PaginationHttp;
}

// Cette interface represente une reponse HTTP paginee de cours officiels.
export interface ReponseListeReferentielsCoursHttp {
  donnees: ReferentielCoursSortie[];
  pagination: PaginationHttp;
}

// Ce controleur orchestre les entrees et sorties HTTP des referentiels academiques.
export class ControleurReferentielsAcademiques {
  private readonly orchestrateurImportReferentiel: OrchestrateurImportReferentiel;
  private readonly casUsagePublierVersionReferentiel: PublierVersionReferentiel;
  private readonly casUsageActiverVersionReferentiel: ActiverVersionReferentiel;
  private readonly casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel;
  private readonly casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme;
  private readonly casUsageListerReferentielsParClasseAcademique:
    ListerReferentielsParClasseAcademique;
  private readonly casUsageListerReferentielsCours: ListerReferentielsCours;
  private readonly casUsageCreerVersionTravailReferentielDepuisVersion?:
    CreerVersionTravailReferentielDepuisVersion;
  private readonly casUsageAjouterLigneVersionReferentielProgramme?:
    AjouterLigneVersionReferentielProgramme;
  private readonly casUsageModifierLigneVersionReferentielProgramme?:
    ModifierLigneVersionReferentielProgramme;
  private readonly casUsageRetirerLigneVersionReferentielProgramme?:
    RetirerLigneVersionReferentielProgramme;
  private readonly casUsageReordonnerLignesVersionReferentielProgramme?:
    ReordonnerLignesVersionReferentielProgramme;
  private readonly casUsageModifierPonderationLigneVersionReferentielProgramme?:
    ModifierPonderationLigneVersionReferentielProgramme;
  private readonly casUsageVerifierCoherenceVersionReferentielAvantPublication?:
    VerifierCoherenceVersionReferentielAvantPublication;
  private readonly autorisationImportReferentiel: AutorisationImportReferentielAdapter;
  private readonly autorisationPublicationReferentiel: AutorisationPublicationReferentielAdapter;
  private readonly autorisationActivationReferentiel: AutorisationActivationReferentielAdapter;
  private readonly autorisationComparaisonReferentiel: AutorisationComparaisonReferentielAdapter;
  private readonly autorisationLectureReferentiel: AutorisationLectureReferentielAdapter;

  // Ce constructeur injecte les services et cas d'usage exposes par les routes referentielles.
  constructor(
    orchestrateurImportReferentiel: OrchestrateurImportReferentiel,
    casUsagePublierVersionReferentiel: PublierVersionReferentiel,
    casUsageActiverVersionReferentiel: ActiverVersionReferentiel,
    casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel,
    casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme,
    casUsageListerReferentielsParClasseAcademique: ListerReferentielsParClasseAcademique,
    casUsageListerReferentielsCours: ListerReferentielsCours,
    autorisationImportReferentiel: AutorisationImportReferentielAdapter =
      new AutorisationImportReferentielAdapter(),
    autorisationPublicationReferentiel: AutorisationPublicationReferentielAdapter =
      new AutorisationPublicationReferentielAdapter(),
    autorisationActivationReferentiel: AutorisationActivationReferentielAdapter =
      new AutorisationActivationReferentielAdapter(),
    autorisationComparaisonReferentiel: AutorisationComparaisonReferentielAdapter =
      new AutorisationComparaisonReferentielAdapter(),
    autorisationLectureReferentiel: AutorisationLectureReferentielAdapter =
      new AutorisationLectureReferentielAdapter(),
    casUsageCreerVersionTravailReferentielDepuisVersion?:
      CreerVersionTravailReferentielDepuisVersion,
    casUsageAjouterLigneVersionReferentielProgramme?: AjouterLigneVersionReferentielProgramme,
    casUsageModifierLigneVersionReferentielProgramme?: ModifierLigneVersionReferentielProgramme,
    casUsageRetirerLigneVersionReferentielProgramme?: RetirerLigneVersionReferentielProgramme,
    casUsageReordonnerLignesVersionReferentielProgramme?:
      ReordonnerLignesVersionReferentielProgramme,
    casUsageModifierPonderationLigneVersionReferentielProgramme?:
      ModifierPonderationLigneVersionReferentielProgramme,
    casUsageVerifierCoherenceVersionReferentielAvantPublication?:
      VerifierCoherenceVersionReferentielAvantPublication,
  ) {
    this.orchestrateurImportReferentiel = orchestrateurImportReferentiel;
    this.casUsagePublierVersionReferentiel = casUsagePublierVersionReferentiel;
    this.casUsageActiverVersionReferentiel = casUsageActiverVersionReferentiel;
    this.casUsageComparerDeuxVersionsReferentiel = casUsageComparerDeuxVersionsReferentiel;
    this.casUsageConsulterReferentielProgramme = casUsageConsulterReferentielProgramme;
    this.casUsageListerReferentielsParClasseAcademique =
      casUsageListerReferentielsParClasseAcademique;
    this.casUsageListerReferentielsCours = casUsageListerReferentielsCours;
    this.casUsageCreerVersionTravailReferentielDepuisVersion =
      casUsageCreerVersionTravailReferentielDepuisVersion;
    this.casUsageAjouterLigneVersionReferentielProgramme =
      casUsageAjouterLigneVersionReferentielProgramme;
    this.casUsageModifierLigneVersionReferentielProgramme =
      casUsageModifierLigneVersionReferentielProgramme;
    this.casUsageRetirerLigneVersionReferentielProgramme =
      casUsageRetirerLigneVersionReferentielProgramme;
    this.casUsageReordonnerLignesVersionReferentielProgramme =
      casUsageReordonnerLignesVersionReferentielProgramme;
    this.casUsageModifierPonderationLigneVersionReferentielProgramme =
      casUsageModifierPonderationLigneVersionReferentielProgramme;
    this.casUsageVerifierCoherenceVersionReferentielAvantPublication =
      casUsageVerifierCoherenceVersionReferentielAvantPublication;
    this.autorisationImportReferentiel = autorisationImportReferentiel;
    this.autorisationPublicationReferentiel = autorisationPublicationReferentiel;
    this.autorisationActivationReferentiel = autorisationActivationReferentiel;
    this.autorisationComparaisonReferentiel = autorisationComparaisonReferentiel;
    this.autorisationLectureReferentiel = autorisationLectureReferentiel;
  }

  // Cette methode traite l'import HTTP des sections scolaires.
  public async importerSectionsDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterSectionsDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportSections(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerSectionsDepuisJson(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des options d'etude.
  public async importerOptionsDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterOptionsDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportOptions(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerOptionsDepuisJson(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des classes academiques.
  public async importerClassesAcademiquesDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterClassesAcademiquesDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportClasses(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerClassesAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des cours academiques.
  public async importerCoursAcademiquesDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterCoursAcademiquesDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportCours(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerCoursAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des programmes academiques.
  public async importerProgrammesAcademiquesDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterProgrammesAcademiquesDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportProgrammes(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerProgrammesAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des lignes de programme.
  public async importerLignesProgrammeDepuisJson(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterLignesProgrammeDepuisJson>> {
    const importePar = await this.verifierMutationImportReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerImportLignes(corps, importePar);
    const sortie = await this.orchestrateurImportReferentiel.importerLignesProgrammeDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite la publication HTTP d'une version de referentiel.
  public async publierVersionReferentiel(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationPublicationReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerPublicationVersion(
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsagePublierVersionReferentiel.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite l'activation HTTP d'une version de referentiel.
  public async activerVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationActivationReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerActivationVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageActiverVersionReferentiel.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite la comparaison HTTP de deux versions de referentiel.
  public async comparerDeuxVersionsReferentiel(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<SortieComparerDeuxVersionsReferentiel>> {
    await this.verifierLectureComparaisonReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerComparaison(corps);
    const sortie = await this.casUsageComparerDeuxVersionsReferentiel.executer(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite la liste HTTP paginee des referentiels programmes.
  public async listerReferentielsProgrammes(
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeReferentielsProgrammesHttp> {
    await this.verifierLectureReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerListeReferentiels(query);
    const sortie = await this.casUsageListerReferentielsParClasseAcademique.executer(entree);

    return {
      donnees: sortie.referentielsProgrammes.map((referentielProgramme) => ({
        ...referentielProgramme,
        versionProjectionnee: referentielProgramme.versionProjectionnee === null
          ? null
          : {
            ...referentielProgramme.versionProjectionnee,
            lignes: referentielProgramme.versionProjectionnee.lignes.map((ligne) => ({
              ...ligne,
              ponderation: { ...ligne.ponderation },
            })),
          },
      })),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode traite la liste HTTP paginee des cours officiels.
  public async listerReferentielsCours(
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeReferentielsCoursHttp> {
    await this.verifierLectureReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerListeReferentielsCours(query);
    const sortie = await this.casUsageListerReferentielsCours.executer(entree);

    return {
      donnees: sortie.referentielsCours,
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode traite la consultation HTTP d'un referentiel programme.
  public async consulterReferentielProgramme(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<ReferentielProgrammeSortie>> {
    await this.verifierLectureReferentiel(contexte);
    const entree = ValidateurReferentielImportHttp.validerConsultationReferentiel(parametres);
    const sortie = await this.casUsageConsulterReferentielProgramme.executer(entree);

    return this.presenterDonnee(sortie.referentielProgramme);
  }

  // Cette methode traite la creation HTTP d'une version de travail a partir d'une version existante.
  public async creerVersionTravailReferentielDepuisVersion(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageCreerVersionTravailReferentielDepuisVersion,
      'creation de version de travail',
    );
    const entree = ValidateurReferentielImportHttp.validerCreationVersionTravail(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite l'ajout HTTP d'une ligne dans une version de travail.
  public async ajouterLigneVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageAjouterLigneVersionReferentielProgramme,
      'ajout de ligne de version',
    );
    const entree = ValidateurReferentielImportHttp.validerAjoutLigneVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite la modification HTTP d'une ligne de version.
  public async modifierLigneVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageModifierLigneVersionReferentielProgramme,
      'modification de ligne de version',
    );
    const entree = ValidateurReferentielImportHttp.validerModificationLigneVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite le retrait HTTP d'une ligne de version.
  public async retirerLigneVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageRetirerLigneVersionReferentielProgramme,
      'retrait de ligne de version',
    );
    const entree = ValidateurReferentielImportHttp.validerRetraitLigneVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite le reordonnancement HTTP des lignes d'une version.
  public async reordonnerLignesVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageReordonnerLignesVersionReferentielProgramme,
      'reordonnancement de lignes de version',
    );
    const entree = ValidateurReferentielImportHttp.validerReordonnancementVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite la modification HTTP de ponderation d'une ligne de version.
  public async modifierPonderationLigneVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageModifierPonderationLigneVersionReferentielProgramme,
      'modification de ponderation de ligne',
    );
    const entree = ValidateurReferentielImportHttp.validerModificationPonderationVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite la verification HTTP de coherence d'une version avant publication.
  public async verifierCoherenceVersionReferentiel(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseDonneeReferentielHttp<VerificationCoherenceVersionReferentielSortie>> {
    const idUtilisateur = await this.verifierMutationEditionReferentiel(contexte);
    const casUsage = this.exigerCasUsage(
      this.casUsageVerifierCoherenceVersionReferentielAvantPublication,
      'verification de coherence de version',
    );
    const entree = ValidateurReferentielImportHttp.validerVerificationCoherenceVersion(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await casUsage.executer(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode construit une reponse HTTP simple a donnee unique.
  private presenterDonnee<TDonnee>(donnee: TDonnee): ReponseDonneeReferentielHttp<TDonnee> {
    return {
      donnee,
    };
  }

  // Cette methode construit le bloc de pagination HTTP d'une reponse liste.
  private creerPagination(total: number, page: number, taillePage: number): PaginationHttp {
    return {
      total,
      page,
      taillePage,
      totalPages: taillePage <= 0 ? 0 : Math.ceil(total / taillePage),
    };
  }

  private async verifierMutationPublicationReferentiel(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour publier une version officielle du referentiel.");
    }

    await this.autorisationPublicationReferentiel.verifierMutationPublicationReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }

  private async verifierMutationImportReferentiel(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour importer une version officielle du referentiel.");
    }

    await this.autorisationImportReferentiel.verifierMutationImportReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }

  private async verifierMutationActivationReferentiel(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour activer une version officielle du referentiel.");
    }

    await this.autorisationActivationReferentiel.verifierMutationActivationReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }

  private async verifierMutationEditionReferentiel(
    contexte?: RequestContext,
  ): Promise<string> {
    return this.verifierMutationPublicationReferentiel(contexte);
  }

  private async verifierLectureComparaisonReferentiel(
    contexte?: RequestContext,
  ): Promise<void> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour comparer des versions officielles du referentiel.");
    }

    await this.autorisationComparaisonReferentiel.verifierLectureComparaisonReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });
  }

  private async verifierLectureReferentiel(contexte?: RequestContext): Promise<void> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour consulter les referentiels officiels.");
    }

    await this.autorisationLectureReferentiel.verifierLectureReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });
  }

  private exigerCasUsage<TCasUsage>(casUsage: TCasUsage | undefined, nomAction: string): TCasUsage {
    if (casUsage === undefined) {
      throw new Error(`Le cas d'usage de ${nomAction} n'est pas configure.`);
    }

    return casUsage;
  }
}
