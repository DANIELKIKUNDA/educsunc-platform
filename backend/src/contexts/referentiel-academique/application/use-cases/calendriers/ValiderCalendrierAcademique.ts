import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyCalendrier } from '../../../domain/policies/PolicyCalendrier';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { MoteurCalendrierAcademique } from '../../../domain/services/MoteurCalendrierAcademique';
import { CalendrierAcademiqueId } from '../../../domain/value-objects/CalendrierAcademiqueId';
import { ValiderCalendrierAcademiqueEntree } from '../../dto/input/ValiderCalendrierAcademiqueEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage ValiderCalendrierAcademique.
export interface SortieValiderCalendrierAcademique {
  calendrierAcademique: CalendrierAcademiqueSortie;
}

// Ce cas d'usage orchestre la validation d'un calendrier academique.
export class ValiderCalendrierAcademique
  implements UseCase<ValiderCalendrierAcademiqueEntree, SortieValiderCalendrierAcademique>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;
  private readonly policyCalendrier: PolicyCalendrier;
  private readonly moteurCalendrierAcademique: MoteurCalendrierAcademique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la validation d'un calendrier academique.
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

  // Cette methode valide la coherence globale d'un calendrier academique existant.
  public async executer(
    entree: ValiderCalendrierAcademiqueEntree,
  ): Promise<SortieValiderCalendrierAcademique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageValidation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'VALIDER_CALENDRIER_ACADEMIQUE',
      entreeValidee.validePar,
      horodatageValidation,
    );

    const calendrierAcademique = await this.depotCalendrierAcademique.trouverParId(
      new CalendrierAcademiqueId(entreeValidee.idCalendrierAcademique),
    );

    if (calendrierAcademique === null) {
      throw new ErreurCalendrierInvalide(
        'Le calendrier academique a valider est introuvable.',
      );
    }

    this.policyCalendrier.verifierCoherenceTemporelleObligatoire(calendrierAcademique);
    this.moteurCalendrierAcademique.validerCalendrier(calendrierAcademique);

    return {
      calendrierAcademique: CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
    };
  }

  private validerEntree(
    entree: ValiderCalendrierAcademiqueEntree,
  ): ValiderCalendrierAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage ValiderCalendrierAcademique est obligatoire.",
      );
    }

    return {
      idCalendrierAcademique: this.validerTexteObligatoire(
        entree.idCalendrierAcademique,
        'idCalendrierAcademique',
      ),
      validePar: this.validerTexteObligatoire(entree.validePar, 'validePar'),
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
