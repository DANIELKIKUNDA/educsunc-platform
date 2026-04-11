import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { Ecole } from '../../../domain/aggregates/Ecole';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ListerClassesPedagogiquesParEcoleEtAnneeEntree } from '../../dto/input/ListerClassesPedagogiquesParEcoleEtAnneeEntree';
import { ListerClassesPedagogiquesParEcoleEtAnneeSortie } from '../../dto/output/ListerClassesPedagogiquesParEcoleEtAnneeSortie';
import { ClassePedagogiqueApplicationMapper } from '../../mappers/ClassePedagogiqueApplicationMapper';

// Ce cas d'usage orchestre la lecture des classes pedagogiques d'une ecole et d'une annee.
export class ListerClassesPedagogiquesParEcoleEtAnnee
  implements UseCase<
    ListerClassesPedagogiquesParEcoleEtAnneeEntree,
    ListerClassesPedagogiquesParEcoleEtAnneeSortie
  >
{
  private readonly depotClassePedagogique: DepotClassePedagogique;
  private readonly depotEcole: DepotEcole;
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des classes pedagogiques.
  constructor(
    depotClassePedagogique: DepotClassePedagogique,
    depotEcole: DepotEcole,
    depotAnneeScolaire: DepotAnneeScolaire,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotClassePedagogique = depotClassePedagogique;
    this.depotEcole = depotEcole;
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des classes pedagogiques d'une ecole pour une annee donnee.
  public async executer(
    entree: ListerClassesPedagogiquesParEcoleEtAnneeEntree,
  ): Promise<ListerClassesPedagogiquesParEcoleEtAnneeSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const ecole = await this.obtenirEcole(entreeValidee.idEcole);
    const anneeScolaire = await this.obtenirAnneeScolaire(entreeValidee.idAnneeScolaire);
    this.verifierAnneeRattacheeAEcole(anneeScolaire, ecole);

    const resultat = await this.depotClassePedagogique.listerParEcoleEtAnnee(
      ecole.obtenirId(),
      anneeScolaire.obtenirId(),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      classesPedagogiques: resultat.donnees.map((classePedagogique) => (
        ClassePedagogiqueApplicationMapper.versSortie(classePedagogique)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private async obtenirEcole(idEcole: string): Promise<Ecole> {
    const ecole = await this.depotEcole.trouverParId(new EcoleId(idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole ciblee est introuvable.",
      );
    }

    return ecole;
  }

  private async obtenirAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaire> {
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire ciblee est introuvable.",
      );
    }

    return anneeScolaire;
  }

  private verifierAnneeRattacheeAEcole(anneeScolaire: AnneeScolaire, ecole: Ecole): void {
    if (!anneeScolaire.obtenirEcoleId().estEgal(ecole.obtenirId())) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'annee scolaire fournie n'appartient pas a l'ecole ciblee.",
      );
    }
  }

  private validerEntree(
    entree: ListerClassesPedagogiquesParEcoleEtAnneeEntree,
  ): ListerClassesPedagogiquesParEcoleEtAnneeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'entree du cas d'usage ListerClassesPedagogiquesParEcoleEtAnnee est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
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

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurClassePedagogiqueInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
