import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ActiverEcoleEntree } from '../../dto/input/ActiverEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Cette interface represente la sortie du cas d'usage ActiverEcole.
export interface SortieActiverEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre l'activation d'une ecole.
export class ActiverEcole implements UseCase<ActiverEcoleEntree, SortieActiverEcole> {
  private readonly depotEcole: DepotEcole;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'activation d'une ecole.
  constructor(
    depotEcole: DepotEcole,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotEcole = depotEcole;
    this.policyAudit = policyAudit;
  }

  // Cette methode active une ecole existante si elle ne l'est pas deja.
  public async executer(entree: ActiverEcoleEntree): Promise<SortieActiverEcole> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ACTIVER_ECOLE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole a activer est introuvable.",
      );
    }

    if (!ecole.estActif()) {
      ecole.activer(entreeValidee.modifiePar);
      await this.depotEcole.sauvegarder(ecole);
    }

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(entree: ActiverEcoleEntree): ActiverEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage ActiverEcole est obligatoire.",
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
