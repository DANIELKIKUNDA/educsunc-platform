import {
  ActiverEcole,
  ChangerModeExploitationEcole,
  ConsulterEcole,
  CreerEcole,
  DesactiverEcole,
  ListerEcoles,
  ListerEcolesParOrganisation,
  MettreAJourInformationsInstitutionnellesEcole,
  RenommerEcole,
} from '../../../application/use-cases/ecoles';
import {
  EcolePresenter,
  ReponseEcoleHttp,
  ReponseListeEcolesHttp,
} from '../presenters/EcolePresenter';
import { ValidateurEcoleHttp } from '../validators/ecole.validator';
import type { RequestContext } from '../../../../../shared/context';
import { AutorisationSocleAcademiqueAdapter } from '../../../../../app/adapters/AutorisationSocleAcademiqueAdapter';
import type { EcoleSortie } from '../../../application/dto/output/EcoleSortie';

export type ResolveurNomActeurEcole = (idUtilisateur: string) => Promise<string | undefined>;

// Ce controleur orchestre les entrees et sorties HTTP des ecoles.
export class ControleurEcoles {
  private readonly casUsageCreerEcole: CreerEcole;
  private readonly casUsageConsulterEcole: ConsulterEcole;
  private readonly casUsageListerEcoles: ListerEcoles;
  private readonly casUsageListerEcolesParOrganisation: ListerEcolesParOrganisation;
  private readonly casUsageChangerModeExploitationEcole: ChangerModeExploitationEcole;
  private readonly casUsageMettreAJourInformationsInstitutionnellesEcole: MettreAJourInformationsInstitutionnellesEcole;
  private readonly casUsageRenommerEcole: RenommerEcole;
  private readonly casUsageActiverEcole: ActiverEcole;
  private readonly casUsageDesactiverEcole: DesactiverEcole;
  private readonly autorisationSocleAcademique: AutorisationSocleAcademiqueAdapter;
  private readonly resoudreNomActeur: ResolveurNomActeurEcole;

  // Ce constructeur injecte les cas d'usage exposes par les routes ecoles.
  constructor(
    casUsageCreerEcole: CreerEcole,
    casUsageConsulterEcole: ConsulterEcole,
    casUsageListerEcoles: ListerEcoles,
    casUsageListerEcolesParOrganisation: ListerEcolesParOrganisation,
    casUsageChangerModeExploitationEcole: ChangerModeExploitationEcole,
    casUsageMettreAJourInformationsInstitutionnellesEcole: MettreAJourInformationsInstitutionnellesEcole,
    casUsageRenommerEcole: RenommerEcole,
    casUsageActiverEcole: ActiverEcole,
    casUsageDesactiverEcole: DesactiverEcole,
    autorisationSocleAcademique: AutorisationSocleAcademiqueAdapter = new AutorisationSocleAcademiqueAdapter(),
    resoudreNomActeur: ResolveurNomActeurEcole = async () => undefined,
  ) {
    this.casUsageCreerEcole = casUsageCreerEcole;
    this.casUsageConsulterEcole = casUsageConsulterEcole;
    this.casUsageListerEcoles = casUsageListerEcoles;
    this.casUsageListerEcolesParOrganisation = casUsageListerEcolesParOrganisation;
    this.casUsageChangerModeExploitationEcole = casUsageChangerModeExploitationEcole;
    this.casUsageMettreAJourInformationsInstitutionnellesEcole =
      casUsageMettreAJourInformationsInstitutionnellesEcole;
    this.casUsageRenommerEcole = casUsageRenommerEcole;
    this.casUsageActiverEcole = casUsageActiverEcole;
    this.casUsageDesactiverEcole = casUsageDesactiverEcole;
    this.autorisationSocleAcademique = autorisationSocleAcademique;
    this.resoudreNomActeur = resoudreNomActeur;
  }

  // Cette methode traite la creation HTTP d'une ecole.
  public async creerEcole(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerCreation(corps, idUtilisateur);
    const sortie = await this.casUsageCreerEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite la consultation HTTP d'une ecole.
  public async consulterEcole(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    await this.verifierLectureAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite la liste HTTP des ecoles.
  public async listerEcoles(
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeEcolesHttp> {
    await this.verifierLectureAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerListe(query);

    if (entree.idOrganisation === undefined) {
      const sortie = await this.casUsageListerEcoles.executer({
        page: entree.page,
        taillePage: entree.taillePage,
      });

      return EcolePresenter.presenterListeEcoles({
        ...sortie,
        ecoles: await Promise.all(sortie.ecoles.map((ecole) => this.enrichirTracabilite(ecole))),
      });
    }

    const sortie = await this.casUsageListerEcolesParOrganisation.executer({
      idOrganisation: entree.idOrganisation,
      page: entree.page,
      taillePage: entree.taillePage,
    });

    return EcolePresenter.presenterListeEcoles({
      ...sortie,
      ecoles: await Promise.all(sortie.ecoles.map((ecole) => this.enrichirTracabilite(ecole))),
    });
  }

  // Cette methode traite la liste HTTP des ecoles rattachees a une organisation.
  public async listerEcolesParOrganisation(
    parametres: unknown,
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeEcolesHttp> {
    await this.verifierLectureAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerListeParOrganisation(parametres, query);
    const sortie = await this.casUsageListerEcolesParOrganisation.executer(entree);

    return EcolePresenter.presenterListeEcoles({
      ...sortie,
      ecoles: await Promise.all(sortie.ecoles.map((ecole) => this.enrichirTracabilite(ecole))),
    });
  }

  // Cette methode traite le changement HTTP du mode d'exploitation d'une ecole.
  public async changerModeExploitationEcole(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerChangementMode(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageChangerModeExploitationEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite le renommage HTTP d'une ecole.
  public async renommerEcole(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerRenommage(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageRenommerEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite la mise a jour HTTP des informations institutionnelles d'une ecole.
  public async mettreAJourInformationsInstitutionnellesEcole(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerMiseAJourInformationsInstitutionnelles(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie =
      await this.casUsageMettreAJourInformationsInstitutionnellesEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite l'activation HTTP d'une ecole.
  public async activerEcole(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerActivation(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageActiverEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  // Cette methode traite la desactivation HTTP d'une ecole.
  public async desactiverEcole(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseEcoleHttp> {
    const idUtilisateur = await this.verifierMutationAdministrationEcoles(contexte);
    const entree = ValidateurEcoleHttp.validerDesactivation(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageDesactiverEcole.executer(entree);

    return EcolePresenter.presenterEcole(await this.enrichirTracabilite(sortie.ecole));
  }

  private async enrichirTracabilite(ecole: EcoleSortie): Promise<EcoleSortie> {
    const ids = [...new Set([ecole.creePar, ecole.modifiePar].filter((id): id is string => Boolean(id)))];
    const noms = new Map<string, string>();

    await Promise.all(ids.map(async (id) => {
      try {
        const nom = await this.resoudreNomActeur(id);
        if (nom) noms.set(id, nom);
      } catch {
        // La fiche reste consultable si une ancienne identite n'est plus resolvable.
      }
    }));

    return {
      ...ecole,
      creeParNom: ecole.creePar ? noms.get(ecole.creePar) : undefined,
      modifieParNom: ecole.modifiePar ? noms.get(ecole.modifiePar) : undefined,
    };
  }

  private async verifierLectureAdministrationEcoles(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour consulter l'administration des ecoles.");
    }

    await this.autorisationSocleAcademique.verifierLectureSocleAcademique({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }

  private async verifierMutationAdministrationEcoles(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour administrer les ecoles.");
    }

    await this.autorisationSocleAcademique.verifierMutationSocleAcademique({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }
}
