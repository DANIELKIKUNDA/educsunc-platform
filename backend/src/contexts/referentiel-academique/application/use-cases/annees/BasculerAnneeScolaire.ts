import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { ErreurTransitionStatutAnneeInterdite } from '../../../domain/exceptions/ErreurTransitionStatutAnneeInterdite';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { StatutAnneeScolaire } from '../../../domain/value-objects/StatutAnneeScolaire';
import { BasculerAnneeScolaireEntree } from '../../dto/input/BasculerAnneeScolaireEntree';
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

// Cette interface represente la sortie de bascule annuelle transactionnelle.
export interface SortieBasculerAnneeScolaire {
  anneeCloturee: AnneeScolaireSortie;
  anneeActive: AnneeScolaireSortie;
  anneeSuivanteCreee: boolean;
}

// Ce cas d'usage cloture l'annee active et active immediatement la suivante.
export class BasculerAnneeScolaire
  implements UseCase<BasculerAnneeScolaireEntree, SortieBasculerAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;
  private readonly serviceCycleAnneeScolaire: ServiceCycleAnneeScolaireRdc;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives de la bascule annuelle.
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

  // Cette methode realise la transition annuelle sans laisser l'ecole sans annee active.
  public async executer(
    entree: BasculerAnneeScolaireEntree,
  ): Promise<SortieBasculerAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);

    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageBascule = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'BASCULER_ANNEE_SCOLAIRE',
        entreeValidee.modifiePar,
        horodatageBascule,
      );

      const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

      if (ecole === null) {
        throw new ErreurEcoleInvalide(
          "L'ecole dont l'annee scolaire doit basculer est introuvable.",
        );
      }

      const anneeCourante = await this.depotAnneeScolaire.verrouillerActiveParEcole(
        ecole.obtenirId(),
      );

      if (anneeCourante === null) {
        throw new ErreurAnneeScolaireInvalide(
          "Aucune annee active ne peut etre basculee pour cette ecole.",
        );
      }

      const proposition = this.serviceCycleAnneeScolaire.proposerAnneeSuivante(
        anneeCourante,
        this.creerSurchargeDates(
          entreeValidee.dateDebutSuivante,
          entreeValidee.dateFinSuivante,
        ),
      );
      const resultatAnneeSuivante = await this.obtenirOuCreerAnneeSuivante(
        ecole.obtenirId(),
        proposition.code,
        proposition.libelle,
        proposition.dateDebut,
        proposition.dateFin,
        entreeValidee,
      );

      anneeCourante.cloturer(entreeValidee.modifiePar);
      await this.depotAnneeScolaire.sauvegarder(anneeCourante);

      resultatAnneeSuivante.anneeScolaire.activer(entreeValidee.modifiePar);
      await this.depotAnneeScolaire.sauvegarder(resultatAnneeSuivante.anneeScolaire);
      await this.serviceJournalAudit.journaliser({
        action: 'BASCULER_ANNEE_SCOLAIRE',
        acteur: entreeValidee.modifiePar,
        typeRessource: 'AnneeScolaire',
        idRessource: resultatAnneeSuivante.anneeScolaire.obtenirId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
        details: {
          anneeCloturee: anneeCourante.obtenirId().obtenirValeur(),
          anneeActive: resultatAnneeSuivante.anneeScolaire.obtenirId().obtenirValeur(),
          anneeSuivanteCreee: resultatAnneeSuivante.creee,
        },
        creeLe: horodatageBascule,
      });

      return {
        anneeCloturee: AnneeScolaireApplicationMapper.versSortie(anneeCourante),
        anneeActive: AnneeScolaireApplicationMapper.versSortie(
          resultatAnneeSuivante.anneeScolaire,
        ),
        anneeSuivanteCreee: resultatAnneeSuivante.creee,
      };
    });
  }

  private async obtenirOuCreerAnneeSuivante(
    idEcole: EcoleId,
    code: string,
    libelle: string,
    dateDebut: Date,
    dateFin: Date,
    entree: BasculerAnneeScolaireEntree,
  ): Promise<{ anneeScolaire: AnneeScolaire; creee: boolean }> {
    const anneeExistante = await this.depotAnneeScolaire.trouverParCodeEtEcole(idEcole, code);

    if (anneeExistante !== null) {
      if (anneeExistante.obtenirStatut() !== StatutAnneeScolaire.PLANIFIEE) {
        throw new ErreurTransitionStatutAnneeInterdite(
          "L'annee suivante existe deja mais elle n'est pas planifiee.",
        );
      }

      return {
        anneeScolaire: anneeExistante,
        creee: false,
      };
    }

    if (entree.creerSuivanteSiAbsente === false) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee suivante doit etre preparee avant la bascule.",
      );
    }

    return {
      anneeScolaire: new AnneeScolaire(
        new AnneeScolaireId(),
        idEcole,
        code,
        libelle,
        dateDebut,
        dateFin,
        entree.modifiePar,
      ),
      creee: true,
    };
  }

  private validerEntree(entree: BasculerAnneeScolaireEntree): BasculerAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage BasculerAnneeScolaire est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
      creerSuivanteSiAbsente: entree.creerSuivanteSiAbsente,
      dateDebutSuivante: this.validerDateOptionnelle(
        entree.dateDebutSuivante,
        'dateDebutSuivante',
      ),
      dateFinSuivante: this.validerDateOptionnelle(
        entree.dateFinSuivante,
        'dateFinSuivante',
      ),
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
