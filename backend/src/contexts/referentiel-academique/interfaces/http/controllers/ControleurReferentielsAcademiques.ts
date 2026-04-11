import { ReferentielProgrammeSortie } from '../../../application/dto/output/ReferentielProgrammeSortie';
import { VersionReferentielProgrammeSortie } from '../../../application/dto/output/VersionReferentielProgrammeSortie';
import { OrchestrateurImportReferentiel } from '../../../application/services/OrchestrateurImportReferentiel';
import {
  ActiverVersionReferentiel,
  ComparerDeuxVersionsReferentiel,
  ConsulterReferentielProgramme,
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

// Ce controleur orchestre les entrees et sorties HTTP des referentiels academiques.
export class ControleurReferentielsAcademiques {
  private readonly orchestrateurImportReferentiel: OrchestrateurImportReferentiel;
  private readonly casUsagePublierVersionReferentiel: PublierVersionReferentiel;
  private readonly casUsageActiverVersionReferentiel: ActiverVersionReferentiel;
  private readonly casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel;
  private readonly casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme;
  private readonly casUsageListerReferentielsParClasseAcademique:
    ListerReferentielsParClasseAcademique;

  // Ce constructeur injecte les services et cas d'usage exposes par les routes referentielles.
  constructor(
    orchestrateurImportReferentiel: OrchestrateurImportReferentiel,
    casUsagePublierVersionReferentiel: PublierVersionReferentiel,
    casUsageActiverVersionReferentiel: ActiverVersionReferentiel,
    casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel,
    casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme,
    casUsageListerReferentielsParClasseAcademique: ListerReferentielsParClasseAcademique,
  ) {
    this.orchestrateurImportReferentiel = orchestrateurImportReferentiel;
    this.casUsagePublierVersionReferentiel = casUsagePublierVersionReferentiel;
    this.casUsageActiverVersionReferentiel = casUsageActiverVersionReferentiel;
    this.casUsageComparerDeuxVersionsReferentiel = casUsageComparerDeuxVersionsReferentiel;
    this.casUsageConsulterReferentielProgramme = casUsageConsulterReferentielProgramme;
    this.casUsageListerReferentielsParClasseAcademique =
      casUsageListerReferentielsParClasseAcademique;
  }

  // Cette methode traite l'import HTTP des sections scolaires.
  public async importerSectionsDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterSectionsDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportSections(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerSectionsDepuisJson(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des options d'etude.
  public async importerOptionsDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterOptionsDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportOptions(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerOptionsDepuisJson(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des classes academiques.
  public async importerClassesAcademiquesDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterClassesAcademiquesDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportClasses(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerClassesAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des cours academiques.
  public async importerCoursAcademiquesDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterCoursAcademiquesDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportCours(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerCoursAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des programmes academiques.
  public async importerProgrammesAcademiquesDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterProgrammesAcademiquesDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportProgrammes(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerProgrammesAcademiquesDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite l'import HTTP des lignes de programme.
  public async importerLignesProgrammeDepuisJson(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieImporterLignesProgrammeDepuisJson>> {
    const entree = ValidateurReferentielImportHttp.validerImportLignes(corps);
    const sortie = await this.orchestrateurImportReferentiel.importerLignesProgrammeDepuisJson(
      entree,
    );

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite la publication HTTP d'une version de referentiel.
  public async publierVersionReferentiel(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const entree = ValidateurReferentielImportHttp.validerPublicationVersion(corps);
    const sortie = await this.casUsagePublierVersionReferentiel.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite l'activation HTTP d'une version de referentiel.
  public async activerVersionReferentiel(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<VersionReferentielProgrammeSortie>> {
    const entree = ValidateurReferentielImportHttp.validerActivationVersion(parametres, corps);
    const sortie = await this.casUsageActiverVersionReferentiel.executer(entree);

    return this.presenterDonnee(sortie.versionReferentielProgramme);
  }

  // Cette methode traite la comparaison HTTP de deux versions de referentiel.
  public async comparerDeuxVersionsReferentiel(
    corps: unknown,
  ): Promise<ReponseDonneeReferentielHttp<SortieComparerDeuxVersionsReferentiel>> {
    const entree = ValidateurReferentielImportHttp.validerComparaison(corps);
    const sortie = await this.casUsageComparerDeuxVersionsReferentiel.executer(entree);

    return this.presenterDonnee(sortie);
  }

  // Cette methode traite la liste HTTP paginee des referentiels programmes.
  public async listerReferentielsProgrammes(
    query: unknown,
  ): Promise<ReponseListeReferentielsProgrammesHttp> {
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

  // Cette methode traite la consultation HTTP d'un referentiel programme.
  public async consulterReferentielProgramme(
    parametres: unknown,
  ): Promise<ReponseDonneeReferentielHttp<ReferentielProgrammeSortie>> {
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
}
