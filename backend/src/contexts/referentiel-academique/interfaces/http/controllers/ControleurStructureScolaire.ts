import { ClasseAcademiqueSortie } from '../../../application/dto/output/ClasseAcademiqueSortie';
import { OptionEtudeSortie } from '../../../application/dto/output/OptionEtudeSortie';
import { SectionScolaireSortie } from '../../../application/dto/output/SectionScolaireSortie';
import {
  ArchiverClassePedagogique,
  CreerClasseAcademique,
  CreerClassePedagogique,
  CreerOptionEtude,
  CreerSectionScolaire,
  DesactiverClassePedagogique,
  ListerClassesAcademiques,
  ListerClassesPedagogiquesParEcoleEtAnnee,
  ListerOptionsEtudes,
  RenommerClassePedagogique,
} from '../../../application/use-cases/structure';
import {
  ClassePedagogiquePresenter,
  ReponseClassePedagogiqueHttp,
  ReponseListeClassesPedagogiquesHttp,
} from '../presenters/ClassePedagogiquePresenter';
import { ValidateurClasseAcademiqueHttp } from '../validators/classe-academique.validator';
import { ValidateurClassePedagogiqueHttp } from '../validators/classe-pedagogique.validator';
import { ValidateurOptionEtudeHttp } from '../validators/option-etude.validator';

interface PaginationHttp {
  total: number;
  page: number;
  taillePage: number;
  totalPages: number;
}

// Cette interface represente la reponse HTTP de detail d'une section scolaire.
export interface ReponseSectionScolaireHttp {
  donnee: SectionScolaireSortie;
}

// Cette interface represente la reponse HTTP de detail d'une classe academique.
export interface ReponseClasseAcademiqueHttp {
  donnee: ClasseAcademiqueSortie;
}

// Cette interface represente la reponse HTTP paginee des classes academiques.
export interface ReponseListeClassesAcademiquesHttp {
  donnees: ClasseAcademiqueSortie[];
  pagination: PaginationHttp;
}

// Cette interface represente la reponse HTTP de detail d'une option d'etude.
export interface ReponseOptionEtudeHttp {
  donnee: OptionEtudeSortie;
}

// Cette interface represente la reponse HTTP paginee des options d'etude.
export interface ReponseListeOptionsEtudesHttp {
  donnees: OptionEtudeSortie[];
  pagination: PaginationHttp;
}

// Ce controleur orchestre les entrees et sorties HTTP de la structure scolaire.
export class ControleurStructureScolaire {
  private readonly casUsageCreerSectionScolaire: CreerSectionScolaire;
  private readonly casUsageCreerClasseAcademique: CreerClasseAcademique;
  private readonly casUsageCreerOptionEtude: CreerOptionEtude;
  private readonly casUsageCreerClassePedagogique: CreerClassePedagogique;
  private readonly casUsageListerClassesAcademiques: ListerClassesAcademiques;
  private readonly casUsageListerClassesPedagogiquesParEcoleEtAnnee:
    ListerClassesPedagogiquesParEcoleEtAnnee;
  private readonly casUsageListerOptionsEtudes: ListerOptionsEtudes;
  private readonly casUsageRenommerClassePedagogique: RenommerClassePedagogique;
  private readonly casUsageDesactiverClassePedagogique: DesactiverClassePedagogique;
  private readonly casUsageArchiverClassePedagogique: ArchiverClassePedagogique;

  // Ce constructeur injecte les cas d'usage exposes par les routes de structure scolaire.
  constructor(
    casUsageCreerSectionScolaire: CreerSectionScolaire,
    casUsageCreerClasseAcademique: CreerClasseAcademique,
    casUsageCreerOptionEtude: CreerOptionEtude,
    casUsageCreerClassePedagogique: CreerClassePedagogique,
    casUsageListerClassesAcademiques: ListerClassesAcademiques,
    casUsageListerClassesPedagogiquesParEcoleEtAnnee: ListerClassesPedagogiquesParEcoleEtAnnee,
    casUsageListerOptionsEtudes: ListerOptionsEtudes,
    casUsageRenommerClassePedagogique: RenommerClassePedagogique,
    casUsageDesactiverClassePedagogique: DesactiverClassePedagogique,
    casUsageArchiverClassePedagogique: ArchiverClassePedagogique,
  ) {
    this.casUsageCreerSectionScolaire = casUsageCreerSectionScolaire;
    this.casUsageCreerClasseAcademique = casUsageCreerClasseAcademique;
    this.casUsageCreerOptionEtude = casUsageCreerOptionEtude;
    this.casUsageCreerClassePedagogique = casUsageCreerClassePedagogique;
    this.casUsageListerClassesAcademiques = casUsageListerClassesAcademiques;
    this.casUsageListerClassesPedagogiquesParEcoleEtAnnee =
      casUsageListerClassesPedagogiquesParEcoleEtAnnee;
    this.casUsageListerOptionsEtudes = casUsageListerOptionsEtudes;
    this.casUsageRenommerClassePedagogique = casUsageRenommerClassePedagogique;
    this.casUsageDesactiverClassePedagogique = casUsageDesactiverClassePedagogique;
    this.casUsageArchiverClassePedagogique = casUsageArchiverClassePedagogique;
  }

  // Cette methode traite la creation HTTP d'une section scolaire.
  public async creerSectionScolaire(corps: unknown): Promise<ReponseSectionScolaireHttp> {
    const entree = ValidateurClasseAcademiqueHttp.validerCreationSection(corps);
    const sortie = await this.casUsageCreerSectionScolaire.executer(entree);

    return {
      donnee: {
        ...sortie.sectionScolaire,
      },
    };
  }

  // Cette methode traite la creation HTTP d'une classe academique.
  public async creerClasseAcademique(corps: unknown): Promise<ReponseClasseAcademiqueHttp> {
    const entree = ValidateurClasseAcademiqueHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerClasseAcademique.executer(entree);

    return {
      donnee: {
        ...sortie.classeAcademique,
      },
    };
  }

  // Cette methode traite la creation HTTP d'une option d'etude.
  public async creerOptionEtude(corps: unknown): Promise<ReponseOptionEtudeHttp> {
    const entree = ValidateurOptionEtudeHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerOptionEtude.executer(entree);

    return {
      donnee: {
        ...sortie.optionEtude,
      },
    };
  }

  // Cette methode traite la creation HTTP d'une classe pedagogique.
  public async creerClassePedagogique(
    corps: unknown,
  ): Promise<ReponseClassePedagogiqueHttp> {
    const entree = ValidateurClassePedagogiqueHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerClassePedagogique.executer(entree);

    return ClassePedagogiquePresenter.presenterClassePedagogique(sortie.classePedagogique);
  }

  // Cette methode traite la liste HTTP paginee des classes academiques.
  public async listerClassesAcademiques(
    query: unknown,
  ): Promise<ReponseListeClassesAcademiquesHttp> {
    const entree = ValidateurClasseAcademiqueHttp.validerListe(query);
    const sortie = await this.casUsageListerClassesAcademiques.executer(entree);

    return {
      donnees: sortie.classesAcademiques.map((classeAcademique) => ({
        ...classeAcademique,
      })),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode traite la liste HTTP paginee des classes pedagogiques.
  public async listerClassesPedagogiques(
    query: unknown,
  ): Promise<ReponseListeClassesPedagogiquesHttp> {
    const entree = ValidateurClassePedagogiqueHttp.validerListe(query);
    const sortie = await this.casUsageListerClassesPedagogiquesParEcoleEtAnnee.executer(entree);

    return ClassePedagogiquePresenter.presenterListeClassesPedagogiques(sortie);
  }

  // Cette methode traite la liste HTTP paginee des options d'etude.
  public async listerOptionsEtudes(query: unknown): Promise<ReponseListeOptionsEtudesHttp> {
    const pagination = ValidateurOptionEtudeHttp.validerListe(query);
    const sortie = await this.casUsageListerOptionsEtudes.executer(pagination);

    return {
      donnees: sortie.optionsEtudes.map((optionEtude) => ({
        ...optionEtude,
      })),
      pagination: this.creerPagination(sortie.total, sortie.page, sortie.taillePage),
    };
  }

  // Cette methode traite le renommage HTTP d'une classe pedagogique.
  public async renommerClassePedagogique(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseClassePedagogiqueHttp> {
    const entree = ValidateurClassePedagogiqueHttp.validerRenommage(parametres, corps);
    const sortie = await this.casUsageRenommerClassePedagogique.executer(entree);

    return ClassePedagogiquePresenter.presenterClassePedagogique(sortie.classePedagogique);
  }

  // Cette methode traite la desactivation HTTP d'une classe pedagogique.
  public async desactiverClassePedagogique(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseClassePedagogiqueHttp> {
    const entree = ValidateurClassePedagogiqueHttp.validerDesactivation(parametres, corps);
    const sortie = await this.casUsageDesactiverClassePedagogique.executer(entree);

    return ClassePedagogiquePresenter.presenterClassePedagogique(sortie.classePedagogique);
  }

  // Cette methode traite l'archivage HTTP d'une classe pedagogique.
  public async archiverClassePedagogique(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseClassePedagogiqueHttp> {
    const entree = ValidateurClassePedagogiqueHttp.validerArchivage(parametres, corps);
    const sortie = await this.casUsageArchiverClassePedagogique.executer(entree);

    return ClassePedagogiquePresenter.presenterClassePedagogique(sortie.classePedagogique);
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
