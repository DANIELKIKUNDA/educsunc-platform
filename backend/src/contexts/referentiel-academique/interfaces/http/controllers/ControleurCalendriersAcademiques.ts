import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import {
  ConsulterCalendrierAcademique,
  ConsulterCalendrierParEcoleEtAnnee,
  CreerCalendrierAcademique,
  ModifierPeriodeCalendrier,
  ValiderCalendrierAcademique,
  VerrouillerCalendrierAcademique,
} from '../../../application/use-cases/calendriers';
import {
  CalendrierAcademiquePresenter,
  ReponseCalendrierAcademiqueHttp,
} from '../presenters/CalendrierAcademiquePresenter';
import {
  EntreeModificationPeriodeCalendrierHttp,
  ValidateurCalendrierAcademiqueHttp,
} from '../validators/calendrier-academique.validator';

// Ce controleur orchestre les entrees et sorties HTTP des calendriers academiques.
export class ControleurCalendriersAcademiques {
  private readonly casUsageCreerCalendrierAcademique: CreerCalendrierAcademique;
  private readonly casUsageModifierPeriodeCalendrier: ModifierPeriodeCalendrier;
  private readonly casUsageValiderCalendrierAcademique: ValiderCalendrierAcademique;
  private readonly casUsageVerrouillerCalendrierAcademique: VerrouillerCalendrierAcademique;
  private readonly casUsageConsulterCalendrierAcademique: ConsulterCalendrierAcademique;
  private readonly casUsageConsulterCalendrierParEcoleEtAnnee:
    ConsulterCalendrierParEcoleEtAnnee;

  // Ce constructeur injecte les cas d'usage exposes par les routes calendaires.
  constructor(
    casUsageCreerCalendrierAcademique: CreerCalendrierAcademique,
    casUsageModifierPeriodeCalendrier: ModifierPeriodeCalendrier,
    casUsageValiderCalendrierAcademique: ValiderCalendrierAcademique,
    casUsageVerrouillerCalendrierAcademique: VerrouillerCalendrierAcademique,
    casUsageConsulterCalendrierAcademique: ConsulterCalendrierAcademique,
    casUsageConsulterCalendrierParEcoleEtAnnee: ConsulterCalendrierParEcoleEtAnnee,
  ) {
    this.casUsageCreerCalendrierAcademique = casUsageCreerCalendrierAcademique;
    this.casUsageModifierPeriodeCalendrier = casUsageModifierPeriodeCalendrier;
    this.casUsageValiderCalendrierAcademique = casUsageValiderCalendrierAcademique;
    this.casUsageVerrouillerCalendrierAcademique = casUsageVerrouillerCalendrierAcademique;
    this.casUsageConsulterCalendrierAcademique = casUsageConsulterCalendrierAcademique;
    this.casUsageConsulterCalendrierParEcoleEtAnnee =
      casUsageConsulterCalendrierParEcoleEtAnnee;
  }

  // Cette methode traite la creation HTTP d'un calendrier academique.
  public async creerCalendrierAcademique(
    corps: unknown,
  ): Promise<ReponseCalendrierAcademiqueHttp> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerCalendrierAcademique.executer(entree);

    return CalendrierAcademiquePresenter.presenterCalendrierAcademique(
      sortie.calendrierAcademique,
    );
  }

  // Cette methode traite la modification HTTP d'une periode a partir de son code documentaire.
  public async modifierPeriodeCalendrier(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseCalendrierAcademiqueHttp> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerModificationPeriode(
      parametres,
      corps,
    );
    const idPeriodeCalendrier = await this.resoudreIdPeriodeCalendrier(entree);
    const sortie = await this.casUsageModifierPeriodeCalendrier.executer({
      idCalendrierAcademique: entree.idCalendrierAcademique,
      idPeriodeCalendrier,
      periode: entree.periode,
      modifiePar: entree.modifiePar,
    });

    return CalendrierAcademiquePresenter.presenterCalendrierAcademique(
      sortie.calendrierAcademique,
    );
  }

  // Cette methode traite la validation HTTP d'un calendrier academique.
  public async validerCalendrierAcademique(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseCalendrierAcademiqueHttp> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerValidation(parametres, corps);
    const sortie = await this.casUsageValiderCalendrierAcademique.executer(entree);

    return CalendrierAcademiquePresenter.presenterCalendrierAcademique(
      sortie.calendrierAcademique,
    );
  }

  // Cette methode traite le verrouillage HTTP d'un calendrier academique.
  public async verrouillerCalendrierAcademique(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseCalendrierAcademiqueHttp> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerVerrouillage(parametres, corps);
    const sortie = await this.casUsageVerrouillerCalendrierAcademique.executer(entree);

    return CalendrierAcademiquePresenter.presenterCalendrierAcademique(
      sortie.calendrierAcademique,
    );
  }

  // Cette methode traite la consultation HTTP d'un calendrier academique.
  public async consulterCalendrierAcademique(
    parametres: unknown,
  ): Promise<ReponseCalendrierAcademiqueHttp> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterCalendrierAcademique.executer(entree);

    return CalendrierAcademiquePresenter.presenterCalendrierAcademique(
      sortie.calendrierAcademique,
    );
  }

  // Cette methode traite la consultation HTTP du calendrier d'une ecole pour une annee.
  public async consulterCalendrierParEcoleEtAnnee(
    query: unknown,
  ): Promise<{ donnee: ReponseCalendrierAcademiqueHttp['donnee'] | null }> {
    const entree = ValidateurCalendrierAcademiqueHttp.validerConsultationParEcoleEtAnnee(query);
    const sortie = await this.casUsageConsulterCalendrierParEcoleEtAnnee.executer(entree);

    return {
      donnee: sortie.calendrierAcademique === null
        ? null
        : CalendrierAcademiquePresenter.presenterCalendrierAcademique(
          sortie.calendrierAcademique,
        ).donnee,
    };
  }

  // Cette methode traduit le code HTTP d'une periode vers son identifiant applicatif.
  private async resoudreIdPeriodeCalendrier(
    entree: EntreeModificationPeriodeCalendrierHttp,
  ): Promise<string> {
    const sortieConsultation = await this.casUsageConsulterCalendrierAcademique.executer({
      idCalendrierAcademique: entree.idCalendrierAcademique,
    });
    const periodeCalendrier = sortieConsultation.calendrierAcademique.periodes.find(
      (periode) => periode.code === entree.codePeriode,
    );

    if (periodeCalendrier === undefined) {
      throw new ErreurCalendrierInvalide(
        `La periode de calendrier avec le code "${entree.codePeriode}" est introuvable.`,
      );
    }

    return periodeCalendrier.id;
  }
}
