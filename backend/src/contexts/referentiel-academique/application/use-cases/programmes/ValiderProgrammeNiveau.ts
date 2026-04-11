import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurValidationProgrammeImpossible } from '../../../domain/exceptions/ErreurValidationProgrammeImpossible';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { MoteurProgrammeLocal } from '../../../domain/services/MoteurProgrammeLocal';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { ValiderProgrammeNiveauEntree } from '../../dto/input/ValiderProgrammeNiveauEntree';
import { EtatLocalProgrammeNiveauSortie } from '../../dto/output/EtatLocalProgrammeNiveauSortie';
import { ProgrammeNiveauSortie } from '../../dto/output/ProgrammeNiveauSortie';
import { EtatLocalProgrammeNiveauApplicationMapper } from '../../mappers/EtatLocalProgrammeNiveauApplicationMapper';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage ValiderProgrammeNiveau.
export interface SortieValiderProgrammeNiveau {
  programmeNiveau: ProgrammeNiveauSortie;
  etatLocalProgramme: EtatLocalProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre la validation d'un programme niveau.
export class ValiderProgrammeNiveau
  implements UseCase<ValiderProgrammeNiveauEntree, SortieValiderProgrammeNiveau>
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly moteurProgrammeLocal: MoteurProgrammeLocal;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;

  // Ce constructeur injecte les dependances applicatives necessaires a la validation d'un programme niveau.
  constructor(
    depotProgrammeNiveau: DepotProgrammeNiveau,
    depotReferentielProgramme: DepotReferentielProgramme,
    moteurProgrammeLocal: MoteurProgrammeLocal = new MoteurProgrammeLocal(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.moteurProgrammeLocal = moteurProgrammeLocal;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
  }

  // Cette methode valide un programme niveau brouillon et retourne son etat local consolide.
  public async executer(
    entree: ValiderProgrammeNiveauEntree,
  ): Promise<SortieValiderProgrammeNiveau> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageValidation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'VALIDER_PROGRAMME_NIVEAU',
        entreeValidee.validePar,
        horodatageValidation,
      );

      const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
        new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
      );

      if (programmeNiveau === null) {
        throw new ErreurProgrammeNiveauInvalide(
          'Le programme niveau a valider est introuvable.',
        );
      }

      const referentielProgramme = await this.depotReferentielProgramme.trouverParId(
        programmeNiveau.obtenirReferentielProgrammeId(),
      );

      if (referentielProgramme === null) {
        throw new ErreurProgrammeInvalide(
          'Le referentiel programme associe au programme niveau est introuvable.',
        );
      }

      const programmeValideExistant = await this.depotProgrammeNiveau.trouverValideParContexte(
        programmeNiveau.obtenirEcoleId(),
        programmeNiveau.obtenirAnneeScolaireId(),
        programmeNiveau.obtenirClasseAcademiqueId(),
      );

      if (
        programmeValideExistant !== null
        && !programmeValideExistant.obtenirId().estEgal(programmeNiveau.obtenirId())
      ) {
        throw new ErreurValidationProgrammeImpossible(
          'Un programme niveau valide existe deja pour cette ecole, cette annee et cette classe.',
        );
      }

      const etatLocalProgramme = this.moteurProgrammeLocal.validerProgramme(
        programmeNiveau,
        referentielProgramme,
        entreeValidee.validePar,
      );

      await this.depotProgrammeNiveau.sauvegarder(programmeNiveau);

      return {
        programmeNiveau: ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau),
        etatLocalProgramme: EtatLocalProgrammeNiveauApplicationMapper.versSortie(
          etatLocalProgramme,
        ),
      };
    });
  }

  private validerEntree(entree: ValiderProgrammeNiveauEntree): ValiderProgrammeNiveauEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage ValiderProgrammeNiveau est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
      validePar: this.validerTexteObligatoire(entree.validePar, 'validePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
