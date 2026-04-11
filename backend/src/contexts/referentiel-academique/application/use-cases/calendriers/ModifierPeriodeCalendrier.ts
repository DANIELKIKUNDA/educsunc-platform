import { UseCase } from '../../../../../shared/application/UseCase';
import { PeriodeCalendrier } from '../../../domain/entities/PeriodeCalendrier';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { MoteurCalendrierAcademique } from '../../../domain/services/MoteurCalendrierAcademique';
import { CalendrierAcademiqueId } from '../../../domain/value-objects/CalendrierAcademiqueId';
import { PeriodeCalendrierId } from '../../../domain/value-objects/PeriodeCalendrierId';
import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';
import { ModifierPeriodeCalendrierEntree } from '../../dto/input/ModifierPeriodeCalendrierEntree';
import { PeriodeCalendrierEntree } from '../../dto/input/PeriodeCalendrierEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage ModifierPeriodeCalendrier.
export interface SortieModifierPeriodeCalendrier {
  calendrierAcademique: CalendrierAcademiqueSortie;
}

// Ce cas d'usage orchestre la modification d'une periode de calendrier.
export class ModifierPeriodeCalendrier
  implements UseCase<ModifierPeriodeCalendrierEntree, SortieModifierPeriodeCalendrier>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;
  private readonly moteurCalendrierAcademique: MoteurCalendrierAcademique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la modification d'une periode de calendrier.
  constructor(
    depotCalendrierAcademique: DepotCalendrierAcademique,
    moteurCalendrierAcademique: MoteurCalendrierAcademique = new MoteurCalendrierAcademique(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotCalendrierAcademique = depotCalendrierAcademique;
    this.moteurCalendrierAcademique = moteurCalendrierAcademique;
    this.policyAudit = policyAudit;
  }

  // Cette methode remplace une periode existante d'un calendrier academique non verrouille.
  public async executer(
    entree: ModifierPeriodeCalendrierEntree,
  ): Promise<SortieModifierPeriodeCalendrier> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'MODIFIER_PERIODE_CALENDRIER',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParId(
      new CalendrierAcademiqueId(entreeValidee.idCalendrierAcademique),
    );

    if (calendrierAcademique === null) {
      throw new ErreurCalendrierInvalide(
        'Le calendrier academique a modifier est introuvable.',
      );
    }

    const idPeriodeCalendrier = new PeriodeCalendrierId(entreeValidee.idPeriodeCalendrier);
    const periodeExistante = calendrierAcademique.obtenirPeriodes().find((periodeCalendrier) =>
      periodeCalendrier.obtenirId().estEgal(idPeriodeCalendrier)
    );

    if (periodeExistante === undefined) {
      throw new ErreurCalendrierInvalide(
        'La periode de calendrier a modifier est introuvable.',
      );
    }

    const periodeMiseAJour = this.creerPeriode(
      idPeriodeCalendrier,
      entreeValidee.periode,
    );

    const periodesMisesAJour = calendrierAcademique.obtenirPeriodes().map((periodeCalendrier) =>
      periodeCalendrier.obtenirId().estEgal(idPeriodeCalendrier)
        ? periodeMiseAJour
        : periodeCalendrier
    );

    this.moteurCalendrierAcademique.modifierDates(
      calendrierAcademique,
      calendrierAcademique.obtenirDateDebutAnnee(),
      calendrierAcademique.obtenirDateFinAnnee(),
      periodesMisesAJour,
      entreeValidee.modifiePar,
    );

    await this.depotCalendrierAcademique.sauvegarder(calendrierAcademique);

    return {
      calendrierAcademique: CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
    };
  }

  private creerPeriode(
    idPeriodeCalendrier: PeriodeCalendrierId,
    periode: PeriodeCalendrierEntree,
  ): PeriodeCalendrier {
    return new PeriodeCalendrier(
      idPeriodeCalendrier,
      periode.code,
      periode.libelle,
      periode.ordre,
      periode.typePeriode,
      periode.dateDebut,
      periode.dateFin,
    );
  }

  private validerEntree(
    entree: ModifierPeriodeCalendrierEntree,
  ): ModifierPeriodeCalendrierEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage ModifierPeriodeCalendrier est obligatoire.",
      );
    }

    return {
      idCalendrierAcademique: this.validerTexteObligatoire(
        entree.idCalendrierAcademique,
        'idCalendrierAcademique',
      ),
      idPeriodeCalendrier: this.validerTexteObligatoire(
        entree.idPeriodeCalendrier,
        'idPeriodeCalendrier',
      ),
      periode: this.validerPeriode(entree.periode),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
    };
  }

  private validerPeriode(periode: PeriodeCalendrierEntree): PeriodeCalendrierEntree {
    if (periode === null || periode === undefined) {
      throw new ErreurCalendrierInvalide(
        'La periode de calendrier a modifier est obligatoire.',
      );
    }

    return {
      code: this.validerTexteObligatoire(periode.code, 'periode.code'),
      libelle: this.validerTexteObligatoire(periode.libelle, 'periode.libelle'),
      ordre: this.validerEntierPositif(periode.ordre, 'periode.ordre'),
      typePeriode: this.validerTypePeriode(periode.typePeriode),
      dateDebut: this.validerDate(periode.dateDebut, 'periode.dateDebut'),
      dateFin: this.validerDate(periode.dateFin, 'periode.dateFin'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }

  private validerTypePeriode(valeur: TypePeriodeCalendrier): TypePeriodeCalendrier {
    if (!Object.values(TypePeriodeCalendrier).includes(valeur)) {
      throw new ErreurCalendrierInvalide(
        'Le type de periode du calendrier est invalide.',
      );
    }

    return valeur;
  }
}
