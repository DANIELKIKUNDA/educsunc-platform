import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ConsulterEcoleEntree } from '../../dto/input/ConsulterEcoleEntree';
import { EcoleSortie } from '../../dto/output/EcoleSortie';
import { EcoleApplicationMapper } from '../../mappers/EcoleApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterEcole.
export interface SortieConsulterEcole {
  ecole: EcoleSortie;
}

// Ce cas d'usage orchestre la consultation d'une ecole.
export class ConsulterEcole implements UseCase<ConsulterEcoleEntree, SortieConsulterEcole> {
  private readonly depotEcole: DepotEcole;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'une ecole.
  constructor(depotEcole: DepotEcole) {
    this.depotEcole = depotEcole;
  }

  // Cette methode consulte une ecole existante a partir de son identifiant.
  public async executer(entree: ConsulterEcoleEntree): Promise<SortieConsulterEcole> {
    const entreeValidee = this.validerEntree(entree);
    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole demandee est introuvable.",
      );
    }

    return {
      ecole: EcoleApplicationMapper.versSortie(ecole),
    };
  }

  private validerEntree(entree: ConsulterEcoleEntree): ConsulterEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage ConsulterEcole est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
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
