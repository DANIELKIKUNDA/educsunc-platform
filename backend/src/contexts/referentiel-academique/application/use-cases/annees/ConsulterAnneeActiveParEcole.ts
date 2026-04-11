import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ConsulterAnneeActiveParEcoleEntree } from '../../dto/input/ConsulterAnneeActiveParEcoleEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterAnneeActiveParEcole.
export interface SortieConsulterAnneeActiveParEcole {
  anneeScolaire: AnneeScolaireSortie | null;
}

// Ce cas d'usage orchestre la consultation de l'annee active d'une ecole.
export class ConsulterAnneeActiveParEcole
  implements UseCase<ConsulterAnneeActiveParEcoleEntree, SortieConsulterAnneeActiveParEcole>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation de l'annee active.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    depotEcole: DepotEcole,
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotEcole = depotEcole;
  }

  // Cette methode retourne l'annee scolaire actuellement active pour une ecole donnee.
  public async executer(
    entree: ConsulterAnneeActiveParEcoleEntree,
  ): Promise<SortieConsulterAnneeActiveParEcole> {
    const entreeValidee = this.validerEntree(entree);
    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole dont l'annee active est demandee est introuvable.",
      );
    }

    const anneeScolaire = await this.depotAnneeScolaire.trouverActiveParEcole(ecole.obtenirId());

    return {
      anneeScolaire: anneeScolaire === null
        ? null
        : AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
    };
  }

  private validerEntree(
    entree: ConsulterAnneeActiveParEcoleEntree,
  ): ConsulterAnneeActiveParEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage ConsulterAnneeActiveParEcole est obligatoire.",
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
