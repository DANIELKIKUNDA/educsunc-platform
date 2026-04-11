import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { StatutProgrammeNiveau } from '../../../domain/value-objects/StatutProgrammeNiveau';
import { ArchiverProgrammeNiveauEntree } from '../../dto/input/ArchiverProgrammeNiveauEntree';
import { ProgrammeNiveauSortie } from '../../dto/output/ProgrammeNiveauSortie';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';

// Cette interface represente la sortie du cas d'usage ArchiverProgrammeNiveau.
export interface SortieArchiverProgrammeNiveau {
  programmeNiveau: ProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre l'archivage d'un programme niveau.
export class ArchiverProgrammeNiveau
  implements UseCase<ArchiverProgrammeNiveauEntree, SortieArchiverProgrammeNiveau>
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'archivage d'un programme niveau.
  constructor(
    depotProgrammeNiveau: DepotProgrammeNiveau,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.policyAudit = policyAudit;
  }

  // Cette methode archive un programme niveau deja valide.
  public async executer(
    entree: ArchiverProgrammeNiveauEntree,
  ): Promise<SortieArchiverProgrammeNiveau> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageArchivage = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ARCHIVER_PROGRAMME_NIVEAU',
      entreeValidee.archivePar,
      horodatageArchivage,
    );

    const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
      new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
    );

    if (programmeNiveau === null) {
      throw new ErreurProgrammeNiveauInvalide(
        'Le programme niveau a archiver est introuvable.',
      );
    }

    if (programmeNiveau.obtenirStatut() !== StatutProgrammeNiveau.VALIDE) {
      throw new ErreurProgrammeNiveauInvalide(
        'Seul un programme niveau valide peut etre archive.',
      );
    }

    programmeNiveau.archiver();
    await this.depotProgrammeNiveau.sauvegarder(programmeNiveau);

    return {
      programmeNiveau: ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau),
    };
  }

  private validerEntree(entree: ArchiverProgrammeNiveauEntree): ArchiverProgrammeNiveauEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage ArchiverProgrammeNiveau est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
      archivePar: this.validerTexteObligatoire(entree.archivePar, 'archivePar'),
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
