import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyCalendrier } from '../../../domain/policies/PolicyCalendrier';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { MoteurCalendrierAcademique } from '../../../domain/services/MoteurCalendrierAcademique';
import { CalendrierAcademiqueId } from '../../../domain/value-objects/CalendrierAcademiqueId';
import { VerrouillerCalendrierAcademiqueEntree } from '../../dto/input/VerrouillerCalendrierAcademiqueEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage VerrouillerCalendrierAcademique.
export interface SortieVerrouillerCalendrierAcademique {
  calendrierAcademique: CalendrierAcademiqueSortie;
}

// Ce cas d'usage orchestre le verrouillage d'un calendrier academique.
export class VerrouillerCalendrierAcademique
  implements UseCase<VerrouillerCalendrierAcademiqueEntree, SortieVerrouillerCalendrierAcademique>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;
  private readonly policyCalendrier: PolicyCalendrier;
  private readonly moteurCalendrierAcademique: MoteurCalendrierAcademique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires au verrouillage d'un calendrier academique.
  constructor(
    depotCalendrierAcademique: DepotCalendrierAcademique,
    policyCalendrier: PolicyCalendrier = new PolicyCalendrier(),
    moteurCalendrierAcademique: MoteurCalendrierAcademique = new MoteurCalendrierAcademique(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotCalendrierAcademique = depotCalendrierAcademique;
    this.policyCalendrier = policyCalendrier;
    this.moteurCalendrierAcademique = moteurCalendrierAcademique;
    this.policyAudit = policyAudit;
  }

  // Cette methode verrouille un calendrier academique apres verification complete de sa coherence.
  public async executer(
    entree: VerrouillerCalendrierAcademiqueEntree,
  ): Promise<SortieVerrouillerCalendrierAcademique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageVerrouillage = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'VERROUILLER_CALENDRIER_ACADEMIQUE',
      entreeValidee.verrouillePar,
      horodatageVerrouillage,
    );

    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParId(
      new CalendrierAcademiqueId(entreeValidee.idCalendrierAcademique),
    );

    if (calendrierAcademique === null) {
      throw new ErreurCalendrierInvalide(
        'Le calendrier academique a verrouiller est introuvable.',
      );
    }

    this.policyCalendrier.verifierCoherenceTemporelleObligatoire(calendrierAcademique);
    this.moteurCalendrierAcademique.verrouillerCalendrier(
      calendrierAcademique,
      entreeValidee.verrouillePar,
    );

    await this.depotCalendrierAcademique.sauvegarder(calendrierAcademique);

    return {
      calendrierAcademique: CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
    };
  }

  private validerEntree(
    entree: VerrouillerCalendrierAcademiqueEntree,
  ): VerrouillerCalendrierAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage VerrouillerCalendrierAcademique est obligatoire.",
      );
    }

    return {
      idCalendrierAcademique: this.validerTexteObligatoire(
        entree.idCalendrierAcademique,
        'idCalendrierAcademique',
      ),
      verrouillePar: this.validerTexteObligatoire(entree.verrouillePar, 'verrouillePar'),
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
}
