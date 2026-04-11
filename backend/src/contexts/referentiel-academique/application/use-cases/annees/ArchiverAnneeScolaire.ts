import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurArchivageAnneeInterdit } from '../../../domain/exceptions/ErreurArchivageAnneeInterdit';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { StatutAnneeScolaire } from '../../../domain/value-objects/StatutAnneeScolaire';
import { ArchiverAnneeScolaireEntree } from '../../dto/input/ArchiverAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage ArchiverAnneeScolaire.
export interface SortieArchiverAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre l'archivage d'une annee scolaire.
export class ArchiverAnneeScolaire
  implements UseCase<ArchiverAnneeScolaireEntree, SortieArchiverAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'archivage d'une annee scolaire.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyAudit = policyAudit;
  }

  // Cette methode archive une annee scolaire cloturee.
  public async executer(
    entree: ArchiverAnneeScolaireEntree,
  ): Promise<SortieArchiverAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ARCHIVER_ANNEE_SCOLAIRE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire a archiver est introuvable.",
      );
    }

    if (anneeScolaire.obtenirStatut() !== StatutAnneeScolaire.CLOTUREE) {
      throw new ErreurArchivageAnneeInterdit(
        'Seule une annee scolaire cloturee peut etre archivee.',
      );
    }

    anneeScolaire.archiver(entreeValidee.modifiePar);
    await this.depotAnneeScolaire.sauvegarder(anneeScolaire);

    return {
      anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
    };
  }

  private validerEntree(
    entree: ArchiverAnneeScolaireEntree,
  ): ArchiverAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage ArchiverAnneeScolaire est obligatoire.",
      );
    }

    return {
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
