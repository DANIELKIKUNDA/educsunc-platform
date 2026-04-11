import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { DesactiverEcoleEntree } from '../../dto/input/DesactiverEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Cette interface represente la sortie du cas d'usage DesactiverEcole.
export interface SortieDesactiverEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre la desactivation d'une ecole.
export class DesactiverEcole implements UseCase<DesactiverEcoleEntree, SortieDesactiverEcole> {
  private readonly depotEcole: DepotEcole;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la desactivation d'une ecole.
  constructor(
    depotEcole: DepotEcole,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotEcole = depotEcole;
    this.policyAudit = policyAudit;
  }

  // Cette methode desactive une ecole existante si elle est encore active.
  public async executer(entree: DesactiverEcoleEntree): Promise<SortieDesactiverEcole> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'DESACTIVER_ECOLE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole a desactiver est introuvable.",
      );
    }

    if (ecole.estActif()) {
      ecole.desactiver(entreeValidee.modifiePar);
      await this.depotEcole.sauvegarder(ecole);
    }

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(entree: DesactiverEcoleEntree): DesactiverEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage DesactiverEcole est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
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
