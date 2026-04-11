import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ConsulterAnneeScolaireEntree } from '../../dto/input/ConsulterAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage ConsulterAnneeScolaire.
export interface SortieConsulterAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre la consultation d'une annee scolaire.
export class ConsulterAnneeScolaire
  implements UseCase<ConsulterAnneeScolaireEntree, SortieConsulterAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;

  // Ce constructeur injecte les dependances applicatives necessaires a la consultation d'une annee scolaire.
  constructor(depotAnneeScolaire: DepotAnneeScolaire) {
    this.depotAnneeScolaire = depotAnneeScolaire;
  }

  // Cette methode consulte une annee scolaire a partir de son identifiant.
  public async executer(
    entree: ConsulterAnneeScolaireEntree,
  ): Promise<SortieConsulterAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire demandee est introuvable.",
      );
    }

    return {
      anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
    };
  }

  private validerEntree(
    entree: ConsulterAnneeScolaireEntree,
  ): ConsulterAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage ConsulterAnneeScolaire est obligatoire.",
      );
    }

    return {
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
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
