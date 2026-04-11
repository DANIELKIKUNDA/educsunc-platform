import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { RenommerClassePedagogiqueEntree } from '../../dto/input/RenommerClassePedagogiqueEntree';
import { ClassePedagogiqueSortie } from '../../dto/output/ClassePedagogiqueSortie';
import { ClassePedagogiqueApplicationMapper } from '../../mappers/ClassePedagogiqueApplicationMapper';

// Cette interface represente la sortie du cas d'usage RenommerClassePedagogique.
export interface SortieRenommerClassePedagogique {
  classePedagogique: ClassePedagogiqueSortie;
}

// Ce cas d'usage orchestre le renommage d'une classe pedagogique.
export class RenommerClassePedagogique
  implements UseCase<RenommerClassePedagogiqueEntree, SortieRenommerClassePedagogique>
{
  private readonly depotClassePedagogique: DepotClassePedagogique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires au renommage d'une classe pedagogique.
  constructor(
    depotClassePedagogique: DepotClassePedagogique,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotClassePedagogique = depotClassePedagogique;
    this.policyAudit = policyAudit;
  }

  // Cette methode renomme une classe pedagogique existante.
  public async executer(
    entree: RenommerClassePedagogiqueEntree,
  ): Promise<SortieRenommerClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'RENOMMER_CLASSE_PEDAGOGIQUE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const classePedagogique = await this.depotClassePedagogique.trouverParId(
      new ClassePedagogiqueId(entreeValidee.idClassePedagogique),
    );

    if (classePedagogique === null) {
      throw new ErreurClassePedagogiqueInvalide(
        "La classe pedagogique a renommer est introuvable.",
      );
    }

    classePedagogique.renommer(entreeValidee.nouveauLibelle);
    await this.depotClassePedagogique.sauvegarder(classePedagogique);

    return {
      classePedagogique: ClassePedagogiqueApplicationMapper.versSortie(classePedagogique),
    };
  }

  private validerEntree(
    entree: RenommerClassePedagogiqueEntree,
  ): RenommerClassePedagogiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'entree du cas d'usage RenommerClassePedagogique est obligatoire.",
      );
    }

    return {
      idClassePedagogique: this.validerTexteObligatoire(entree.idClassePedagogique, 'idClassePedagogique'),
      nouveauLibelle: this.validerTexteObligatoire(entree.nouveauLibelle, 'nouveauLibelle'),
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
