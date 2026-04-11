import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ListerAnneesScolairesParEcoleEntree } from '../../dto/input/ListerAnneesScolairesParEcoleEntree';
import { ListerAnneesScolairesParEcoleSortie } from '../../dto/output/ListerAnneesScolairesParEcoleSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';

// Ce cas d'usage orchestre la lecture des annees scolaires d'une ecole.
export class ListerAnneesScolairesParEcole
  implements UseCase<ListerAnneesScolairesParEcoleEntree, ListerAnneesScolairesParEcoleSortie>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des annees scolaires d'une ecole.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    depotEcole: DepotEcole,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotEcole = depotEcole;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des annees scolaires d'une ecole.
  public async executer(
    entree: ListerAnneesScolairesParEcoleEntree,
  ): Promise<ListerAnneesScolairesParEcoleSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole dont les annees doivent etre listees est introuvable.",
      );
    }

    const resultat = await this.depotAnneeScolaire.listerParEcole(
      ecole.obtenirId(),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      anneesScolaires: resultat.donnees.map((anneeScolaire) => (
        AnneeScolaireApplicationMapper.versSortie(anneeScolaire)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerAnneesScolairesParEcoleEntree,
  ): ListerAnneesScolairesParEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurEcoleInvalide(
        "L'entree du cas d'usage ListerAnneesScolairesParEcole est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
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

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurEcoleInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
