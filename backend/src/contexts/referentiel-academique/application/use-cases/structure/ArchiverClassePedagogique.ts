import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurArchivageClasseInterdit } from '../../../domain/exceptions/ErreurArchivageClasseInterdit';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { ArchiverClassePedagogiqueEntree } from '../../dto/input/ArchiverClassePedagogiqueEntree';
import { ClassePedagogiqueSortie } from '../../dto/output/ClassePedagogiqueSortie';
import { ClassePedagogiqueApplicationMapper } from '../../mappers/ClassePedagogiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage ArchiverClassePedagogique.
export interface SortieArchiverClassePedagogique {
  classePedagogique: ClassePedagogiqueSortie;
}

// Ce cas d'usage orchestre l'archivage d'une classe pedagogique.
export class ArchiverClassePedagogique
  implements UseCase<ArchiverClassePedagogiqueEntree, SortieArchiverClassePedagogique>
{
  private readonly depotClassePedagogique: DepotClassePedagogique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'archivage d'une classe pedagogique.
  constructor(
    depotClassePedagogique: DepotClassePedagogique,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotClassePedagogique = depotClassePedagogique;
    this.policyAudit = policyAudit;
  }

  // Cette methode archive une classe pedagogique non encore archivee.
  public async executer(
    entree: ArchiverClassePedagogiqueEntree,
  ): Promise<SortieArchiverClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ARCHIVER_CLASSE_PEDAGOGIQUE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const classePedagogique = await this.depotClassePedagogique.trouverParId(
      new ClassePedagogiqueId(entreeValidee.idClassePedagogique),
    );

    if (classePedagogique === null) {
      throw new ErreurClassePedagogiqueInvalide(
        "La classe pedagogique a archiver est introuvable.",
      );
    }

    if (classePedagogique.obtenirArchiveLe() !== undefined) {
      throw new ErreurArchivageClasseInterdit(
        'La classe pedagogique est deja archivee.',
      );
    }

    classePedagogique.archiver();
    await this.depotClassePedagogique.sauvegarder(classePedagogique);

    return {
      classePedagogique: ClassePedagogiqueApplicationMapper.versSortie(classePedagogique),
    };
  }

  private validerEntree(
    entree: ArchiverClassePedagogiqueEntree,
  ): ArchiverClassePedagogiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'entree du cas d'usage ArchiverClassePedagogique est obligatoire.",
      );
    }

    return {
      idClassePedagogique: this.validerTexteObligatoire(entree.idClassePedagogique, 'idClassePedagogique'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurClassePedagogiqueInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurClassePedagogiqueInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
