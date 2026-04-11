import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { CreerAnneeScolaireEntree } from '../../dto/input/CreerAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage CreerAnneeScolaire.
export interface SortieCreerAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre la creation d'une annee scolaire.
export class CreerAnneeScolaire
  implements UseCase<CreerAnneeScolaireEntree, SortieCreerAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une annee scolaire.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    depotEcole: DepotEcole,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotEcole = depotEcole;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
  }

  // Cette methode cree une annee scolaire pour une ecole existante.
  public async executer(entree: CreerAnneeScolaireEntree): Promise<SortieCreerAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageCreation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'CREER_ANNEE_SCOLAIRE',
        entreeValidee.creePar,
        horodatageCreation,
      );

      const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

      if (ecole === null) {
        throw new ErreurEcoleInvalide(
          "L'ecole de rattachement de l'annee scolaire est introuvable.",
        );
      }

      const anneeScolaire = new AnneeScolaire(
        new AnneeScolaireId(),
        ecole.obtenirId(),
        entreeValidee.code,
        entreeValidee.libelle,
        entreeValidee.dateDebut,
        entreeValidee.dateFin,
        entreeValidee.creePar,
      );

      await this.depotAnneeScolaire.sauvegarder(anneeScolaire);

      return {
        anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
      };
    });
  }

  private validerEntree(entree: CreerAnneeScolaireEntree): CreerAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage CreerAnneeScolaire est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      code: this.validerTexteObligatoire(entree.code, 'code'),
      libelle: this.validerTexteObligatoire(entree.libelle, 'libelle'),
      dateDebut: this.validerDate(entree.dateDebut, 'dateDebut'),
      dateFin: this.validerDate(entree.dateFin, 'dateFin'),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
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

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }
}
