import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ListerProgrammesNiveauParEcoleEtAnneeEntree } from '../../dto/input/ListerProgrammesNiveauParEcoleEtAnneeEntree';
import { ListerProgrammesNiveauParEcoleEtAnneeSortie } from '../../dto/output/ListerProgrammesNiveauParEcoleEtAnneeSortie';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';

// Ce cas d'usage orchestre la lecture des programmes niveau par ecole et annee.
export class ListerProgrammesNiveauParEcoleEtAnnee
  implements
    UseCase<
      ListerProgrammesNiveauParEcoleEtAnneeEntree,
      ListerProgrammesNiveauParEcoleEtAnneeSortie
    >
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly depotEcole: DepotEcole;
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des programmes niveau.
  constructor(
    depotProgrammeNiveau: DepotProgrammeNiveau,
    depotEcole: DepotEcole,
    depotAnneeScolaire: DepotAnneeScolaire,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.depotEcole = depotEcole;
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne les programmes niveau d'une ecole pour une annee donnee.
  public async executer(
    entree: ListerProgrammesNiveauParEcoleEtAnneeEntree,
  ): Promise<ListerProgrammesNiveauParEcoleEtAnneeSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole cible du listage est introuvable.",
      );
    }

    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire cible du listage est introuvable.",
      );
    }

    if (!anneeScolaire.obtenirEcoleId().estEgal(ecole.obtenirId())) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire fournie n'appartient pas a l'ecole cible.",
      );
    }

    const resultat = await this.depotProgrammeNiveau.listerParEcoleEtAnnee(
      ecole.obtenirId(),
      anneeScolaire.obtenirId(),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      programmesNiveau: resultat.donnees.map((programmeNiveau) =>
        ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau)
      ),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerProgrammesNiveauParEcoleEtAnneeEntree,
  ): ListerProgrammesNiveauParEcoleEtAnneeEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage ListerProgrammesNiveauParEcoleEtAnnee est obligatoire.",
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
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurProgrammeNiveauInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
