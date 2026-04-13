import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { PreparerAnneeScolaireSuivanteEntree } from '../../dto/input/PreparerAnneeScolaireSuivanteEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';
import {
  ServiceCycleAnneeScolaireRdc,
  SurchargeDatesAnneeScolaireAdministrative,
} from '../../services/ServiceCycleAnneeScolaireRdc';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie de preparation de l'annee scolaire suivante.
export interface SortiePreparerAnneeScolaireSuivante {
  anneeScolaire: AnneeScolaireSortie;
  dejaExistante: boolean;
}

// Ce cas d'usage prepare une annee suivante planifiee sans modifier l'annee active.
export class PreparerAnneeScolaireSuivante
  implements UseCase<PreparerAnneeScolaireSuivanteEntree, SortiePreparerAnneeScolaireSuivante>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;
  private readonly serviceCycleAnneeScolaire: ServiceCycleAnneeScolaireRdc;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives utiles a la preparation annuelle.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    depotEcole: DepotEcole,
    serviceCycleAnneeScolaire: ServiceCycleAnneeScolaireRdc = new ServiceCycleAnneeScolaireRdc(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotEcole = depotEcole;
    this.serviceCycleAnneeScolaire = serviceCycleAnneeScolaire;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode cree l'annee suivante si elle n'existe pas encore.
  public async executer(
    entree: PreparerAnneeScolaireSuivanteEntree,
  ): Promise<SortiePreparerAnneeScolaireSuivante> {
    const entreeValidee = this.validerEntree(entree);

    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatagePreparation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'PREPARER_ANNEE_SCOLAIRE_SUIVANTE',
        entreeValidee.creePar,
        horodatagePreparation,
      );

      const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

      if (ecole === null) {
        throw new ErreurEcoleInvalide(
          "L'ecole de rattachement de l'annee suivante est introuvable.",
        );
      }

      const anneeActive = await this.depotAnneeScolaire.trouverActiveParEcole(
        ecole.obtenirId(),
      );

      if (anneeActive === null) {
        throw new ErreurAnneeScolaireInvalide(
          "Une annee active est necessaire pour preparer l'annee suivante.",
        );
      }

      const proposition = this.serviceCycleAnneeScolaire.proposerAnneeSuivante(
        anneeActive,
        this.creerSurchargeDates(entreeValidee.dateDebut, entreeValidee.dateFin),
      );
      const anneeExistante = await this.depotAnneeScolaire.trouverParCodeEtEcole(
        ecole.obtenirId(),
        proposition.code,
      );

      if (anneeExistante !== null) {
        return {
          anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeExistante),
          dejaExistante: true,
        };
      }

      const anneeSuivante = new AnneeScolaire(
        new AnneeScolaireId(),
        ecole.obtenirId(),
        proposition.code,
        proposition.libelle,
        proposition.dateDebut,
        proposition.dateFin,
        entreeValidee.creePar,
      );

      await this.depotAnneeScolaire.sauvegarder(anneeSuivante);
      await this.serviceJournalAudit.journaliser({
        action: 'PREPARER_ANNEE_SCOLAIRE_SUIVANTE',
        acteur: entreeValidee.creePar,
        typeRessource: 'AnneeScolaire',
        idRessource: anneeSuivante.obtenirId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
        details: {
          code: anneeSuivante.obtenirCode(),
          statut: anneeSuivante.obtenirStatut(),
          anneeSource: anneeActive.obtenirId().obtenirValeur(),
        },
        creeLe: horodatagePreparation,
      });

      return {
        anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeSuivante),
        dejaExistante: false,
      };
    });
  }

  private validerEntree(
    entree: PreparerAnneeScolaireSuivanteEntree,
  ): PreparerAnneeScolaireSuivanteEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage PreparerAnneeScolaireSuivante est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
      dateDebut: this.validerDateOptionnelle(entree.dateDebut, 'dateDebut'),
      dateFin: this.validerDateOptionnelle(entree.dateFin, 'dateFin'),
    };
  }

  private creerSurchargeDates(
    dateDebut?: Date,
    dateFin?: Date,
  ): SurchargeDatesAnneeScolaireAdministrative {
    return {
      dateDebut,
      dateFin,
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

  private validerDateOptionnelle(valeur: Date | undefined, nomChamp: string): Date | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }
}
