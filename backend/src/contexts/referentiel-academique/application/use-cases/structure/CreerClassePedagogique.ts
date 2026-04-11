import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { ClassePedagogique } from '../../../domain/aggregates/ClassePedagogique';
import { Ecole } from '../../../domain/aggregates/Ecole';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurClassePedagogiqueDupliquee } from '../../../domain/exceptions/ErreurClassePedagogiqueDupliquee';
import { ErreurClassePedagogiqueInvalide } from '../../../domain/exceptions/ErreurClassePedagogiqueInvalide';
import { ErreurEcoleInactive } from '../../../domain/exceptions/ErreurEcoleInactive';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotClassePedagogique } from '../../../domain/repositories/DepotClassePedagogique';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../../../domain/value-objects/ClassePedagogiqueId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { CreerClassePedagogiqueEntree } from '../../dto/input/CreerClassePedagogiqueEntree';
import { ClassePedagogiqueSortie } from '../../dto/output/ClassePedagogiqueSortie';
import { ClassePedagogiqueApplicationMapper } from '../../mappers/ClassePedagogiqueApplicationMapper';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage CreerClassePedagogique.
export interface SortieCreerClassePedagogique {
  classePedagogique: ClassePedagogiqueSortie;
}

// Ce cas d'usage orchestre la creation d'une classe pedagogique.
export class CreerClassePedagogique
  implements UseCase<CreerClassePedagogiqueEntree, SortieCreerClassePedagogique>
{
  private readonly depotClassePedagogique: DepotClassePedagogique;
  private readonly depotEcole: DepotEcole;
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une classe pedagogique.
  constructor(
    depotClassePedagogique: DepotClassePedagogique,
    depotEcole: DepotEcole,
    depotAnneeScolaire: DepotAnneeScolaire,
    depotClasseAcademique: DepotClasseAcademique,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {
    this.depotClassePedagogique = depotClassePedagogique;
    this.depotEcole = depotEcole;
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotClasseAcademique = depotClasseAcademique;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
  }

  // Cette methode cree une classe pedagogique locale dans le contexte d'une ecole et d'une annee.
  public async executer(
    entree: CreerClassePedagogiqueEntree,
  ): Promise<SortieCreerClassePedagogique> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageCreation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'CREER_CLASSE_PEDAGOGIQUE',
        entreeValidee.creePar,
        horodatageCreation,
      );

      const ecole = await this.obtenirEcole(entreeValidee.idEcole);
      this.verifierEcoleActive(ecole);

      const anneeScolaire = await this.obtenirAnneeScolaire(entreeValidee.idAnneeScolaire);
      this.verifierAnneeRattacheeAEcole(anneeScolaire, ecole);
      this.verifierAnneeActive(anneeScolaire);

      const classeAcademique = await this.obtenirClasseAcademique(entreeValidee.idClasseAcademique);
      this.verifierClasseAcademiqueActive(classeAcademique);

      const classePedagogiqueExistante = await this.depotClassePedagogique.trouverParCodeDansContexte(
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
        entreeValidee.code,
      );

      if (classePedagogiqueExistante !== null) {
        throw new ErreurClassePedagogiqueDupliquee(
          'Une classe pedagogique avec ce code existe deja dans cette ecole et pour cette annee.',
        );
      }

      const classePedagogique = new ClassePedagogique(
        new ClassePedagogiqueId(),
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
        classeAcademique.obtenirId(),
        entreeValidee.code,
        entreeValidee.libelle,
        entreeValidee.suffixeParallele,
        entreeValidee.capaciteAccueil,
      );

      await this.depotClassePedagogique.sauvegarder(classePedagogique);

      return {
        classePedagogique: ClassePedagogiqueApplicationMapper.versSortie(classePedagogique),
      };
    });
  }

  private async obtenirEcole(idEcole: string): Promise<Ecole> {
    const ecole = await this.depotEcole.trouverParId(new EcoleId(idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole de rattachement de la classe pedagogique est introuvable.",
      );
    }

    return ecole;
  }

  private verifierEcoleActive(ecole: Ecole): void {
    if (!ecole.estActif()) {
      throw new ErreurEcoleInactive(
        'Une classe pedagogique ne peut pas etre creee dans une ecole inactive.',
      );
    }
  }

  private async obtenirAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaire> {
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire de rattachement est introuvable.",
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

  private verifierAnneeActive(anneeScolaire: AnneeScolaire): void {
    if (!anneeScolaire.estActive()) {
      throw new ErreurClassePedagogiqueInvalide(
        'La classe pedagogique doit etre rattachee a une annee scolaire active.',
      );
    }
  }

  private async obtenirClasseAcademique(idClasseAcademique: string) {
    const classeAcademique = await this.depotClasseAcademique.trouverParId(
      new ClasseAcademiqueId(idClasseAcademique),
    );

    if (classeAcademique === null) {
      throw new ErreurClasseAcademiqueInvalide(
        "La classe academique de rattachement est introuvable.",
      );
    }

    return classeAcademique;
  }

  private verifierClasseAcademiqueActive(
    classeAcademique: Awaited<ReturnType<CreerClassePedagogique['obtenirClasseAcademique']>>,
  ): void {
    if (!classeAcademique.estActive()) {
      throw new ErreurClassePedagogiqueInvalide(
        'Une classe pedagogique doit etre rattachee a une classe academique active.',
      );
    }
  }

  private validerEntree(
    entree: CreerClassePedagogiqueEntree,
  ): CreerClassePedagogiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurClassePedagogiqueInvalide(
        "L'entree du cas d'usage CreerClassePedagogique est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      idClasseAcademique: this.validerTexteObligatoire(entree.idClasseAcademique, 'idClasseAcademique'),
      code: this.validerTexteObligatoire(entree.code, 'code'),
      libelle: this.validerTexteObligatoire(entree.libelle, 'libelle'),
      suffixeParallele: this.validerTexteOptionnel(entree.suffixeParallele),
      capaciteAccueil: this.validerEntierPositifOptionnel(entree.capaciteAccueil, 'capaciteAccueil'),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
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

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurClassePedagogiqueInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerEntierPositifOptionnel(
    valeur: number | undefined,
    nomChamp: string,
  ): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurClassePedagogiqueInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
