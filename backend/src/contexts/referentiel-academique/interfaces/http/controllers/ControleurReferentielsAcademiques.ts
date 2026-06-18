import { ReferentielProgrammeSortie } from '../../../application/dto/output/ReferentielProgrammeSortie';
import { ReferentielCoursSortie } from '../../../application/dto/output/ReferentielCoursSortie';
import { VersionReferentielProgrammeSortie } from '../../../application/dto/output/VersionReferentielProgrammeSortie';
import { OrchestrateurImportReferentiel } from '../../../application/services/OrchestrateurImportReferentiel';
import {
  ActiverVersionReferentiel,
  ComparerDeuxVersionsReferentiel,
  ConsulterReferentielProgramme,
  ListerReferentielsCours,
  ListerReferentielsParClasseAcademique,
  PublierVersionReferentiel,
  SortieComparerDeuxVersionsReferentiel,
  SortieImporterClassesAcademiquesDepuisJson,
  SortieImporterCoursAcademiquesDepuisJson,
  SortieImporterLignesProgrammeDepuisJson,
  SortieImporterOptionsDepuisJson,
  SortieImporterProgrammesAcademiquesDepuisJson,
  SortieImporterSectionsDepuisJson,
} from '../../../application/use-cases/referentiels';
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
  ) {
    this.orchestrateurImportReferentiel = orchestrateurImportReferentiel;
    this.casUsagePublierVersionReferentiel = casUsagePublierVersionReferentiel;
    this.casUsageActiverVersionReferentiel = casUsageActiverVersionReferentiel;
    this.casUsageComparerDeuxVersionsReferentiel = casUsageComparerDeuxVersionsReferentiel;
    this.casUsageConsulterReferentielProgramme = casUsageConsulterReferentielProgramme;
    this.casUsageListerReferentielsParClasseAcademique =
      casUsageListerReferentielsParClasseAcademique;
    this.casUsageListerReferentielsCours = casUsageListerReferentielsCours;
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
}
