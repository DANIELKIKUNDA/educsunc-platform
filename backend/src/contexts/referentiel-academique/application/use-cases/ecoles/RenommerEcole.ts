import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { RenommerEcoleEntree } from '../../dto/input/RenommerEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Cette interface represente la sortie du cas d'usage RenommerEcole.
export interface SortieRenommerEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre le renommage d'une ecole.
export class RenommerEcole implements UseCase<RenommerEcoleEntree, SortieRenommerEcole> {
  private readonly depotEcole: DepotEcole;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires au renommage d'une ecole.
  constructor(
    depotEcole: DepotEcole,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotEcole = depotEcole;
    this.policyAudit = policyAudit;
  }

  // Cette methode renomme une ecole existante.
  public async executer(entree: RenommerEcoleEntree): Promise<SortieRenommerEcole> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'RENOMMER_ECOLE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole a renommer est introuvable.",
      );
    }

    ecole.renommer(entreeValidee.nouveauNom, entreeValidee.modifiePar);
    await this.depotEcole.sauvegarder(ecole);

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(entree: RenommerEcoleEntree): RenommerEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage RenommerEcole est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      nouveauNom: this.validerTexteObligatoire(entree.nouveauNom, 'nouveauNom'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
