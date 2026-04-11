import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { PolicyPerformance } from '../../../domain/policies/PolicyPerformance';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ListerReferentielsParClasseAcademiqueEntree } from '../../dto/input/ListerReferentielsParClasseAcademiqueEntree';
import { ListerReferentielsParClasseAcademiqueSortie } from '../../dto/output/ListerReferentielsParClasseAcademiqueSortie';
import { ReferentielProgrammeApplicationMapper } from '../../mappers/ReferentielProgrammeApplicationMapper';

// Ce cas d'usage orchestre la lecture des referentiels programmes pour une classe academique.
export class ListerReferentielsParClasseAcademique
  implements UseCase<
    ListerReferentielsParClasseAcademiqueEntree,
    ListerReferentielsParClasseAcademiqueSortie
  >
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly policyPerformance: PolicyPerformance;

  // Ce constructeur injecte les dependances applicatives necessaires au listage des referentiels programmes.
  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotClasseAcademique: DepotClasseAcademique,
    policyPerformance: PolicyPerformance = new PolicyPerformance(),
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.depotClasseAcademique = depotClasseAcademique;
    this.policyPerformance = policyPerformance;
  }

  // Cette methode retourne la liste paginee des referentiels programmes d'une classe academique.
  public async executer(
    entree: ListerReferentielsParClasseAcademiqueEntree,
  ): Promise<ListerReferentielsParClasseAcademiqueSortie> {
    const entreeValidee = this.validerEntree(entree);

    this.policyPerformance.verifierPaginationObligatoire(
      entreeValidee.page,
      entreeValidee.taillePage,
    );

    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      new ClasseAcademiqueId(entreeValidee.idClasseAcademique),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        "La classe academique ciblee est introuvable.",
      );
    }

    const resultat = await this.depotReferentielProgramme.listerParClasseAcademique(
      classeAcademique.obtenirId(),
      {
        page: entreeValidee.page,
        taillePage: entreeValidee.taillePage,
      },
    );

    return {
      referentielsProgrammes: resultat.donnees.map((referentielProgramme) => (
        ReferentielProgrammeApplicationMapper.versSortie(referentielProgramme)
      )),
      total: resultat.total,
      page: resultat.page,
      taillePage: resultat.taillePage,
    };
  }

  private validerEntree(
    entree: ListerReferentielsParClasseAcademiqueEntree,
  ): ListerReferentielsParClasseAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClasseAcademiqueInvalide(
        "L'entree du cas d'usage ListerReferentielsParClasseAcademique est obligatoire.",
      );
    }

    return {
      idClasseAcademique: this.validerTexteObligatoire(entree.idClasseAcademique, 'idClasseAcademique'),
      page: this.validerEntierPositif(entree.page, 'page'),
      taillePage: this.validerEntierPositif(entree.taillePage, 'taillePage'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurClasseAcademiqueInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
