import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { DesactiverClassePedagogiqueEntree } from '../../dto/input/DesactiverClassePedagogiqueEntree';
import { ClassePedagogiqueSortie } from '../../dto/output/ClassePedagogiqueSortie';
import { ClassePedagogiqueApplicationMapper } from '../../mappers/ClassePedagogiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage DesactiverClassePedagogique.
export interface SortieDesactiverClassePedagogique {
  classePedagogique: ClassePedagogiqueSortie;
}

// Ce cas d'usage orchestre la desactivation d'une classe pedagogique.
export class DesactiverClassePedagogique
  implements UseCase<DesactiverClassePedagogiqueEntree, SortieDesactiverClassePedagogique>
{
  private readonly depotClassePedagogique: DepotClassePedagogique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la desactivation d'une classe pedagogique.
  constructor(
    depotClassePedagogique: DepotClassePedagogique,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotClassePedagogique = depotClassePedagogique;
    this.policyAudit = policyAudit;
  }

  // Cette methode desactive une classe pedagogique existante.
  public async executer(
    entree: DesactiverClassePedagogiqueEntree,
  ): Promise<SortieDesactiverClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'DESACTIVER_CLASSE_PEDAGOGIQUE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const classePedagogique = await this.depotClassePedagogique.trouverParId(
      new ClassePedagogiqueId(entreeValidee.idClassePedagogique),
    );

    if (classePedagogique === null) {
      throw new ErreurClassePedagogiqueInvalide(
        "La classe pedagogique a desactiver est introuvable.",
      );
    }

    if (classePedagogique.estActive()) {
      classePedagogique.desactiver();
      await this.depotClassePedagogique.sauvegarder(classePedagogique);
    }

    return {
      classePedagogique: ClassePedagogiqueApplicationMapper.versSortie(classePedagogique),
    };
  }

  private validerEntree(
    entree: DesactiverClassePedagogiqueEntree,
  ): DesactiverClassePedagogiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'entree du cas d'usage DesactiverClassePedagogique est obligatoire.",
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
