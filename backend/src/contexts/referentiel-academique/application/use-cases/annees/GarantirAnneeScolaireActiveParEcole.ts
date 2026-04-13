import { UseCase } from '../../../../../shared/application/UseCase';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { GarantirAnneeScolaireActiveParEcoleEntree } from '../../dto/input/GarantirAnneeScolaireActiveParEcoleEntree';
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

// Cette enumeration locale explicite le resultat de la garantie d'annee active.
export type ActionGarantieAnneeScolaireActive =
  | 'EXISTANTE'
  | 'CREEE_ET_ACTIVEE'
  | 'PLANIFIEE_ACTIVEE';

// Cette interface represente la sortie de garantie d'une annee scolaire active.
export interface SortieGarantirAnneeScolaireActiveParEcole {
  anneeScolaire: AnneeScolaireSortie;
  action: ActionGarantieAnneeScolaireActive;
}

// Ce cas d'usage garantit qu'une ecole dispose d'une annee scolaire active exploitable.
export class GarantirAnneeScolaireActiveParEcole
  implements UseCase<
    GarantirAnneeScolaireActiveParEcoleEntree,
    SortieGarantirAnneeScolaireActiveParEcole
  >
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotEcole: DepotEcole;
  private readonly serviceCycleAnneeScolaire: ServiceCycleAnneeScolaireRdc;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives de securisation annuelle.
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

  // Cette methode couvre le secours SaaS sans contourner le cycle de vie de l'agregat.
  public async executer(
    entree: GarantirAnneeScolaireActiveParEcoleEntree,
  ): Promise<SortieGarantirAnneeScolaireActiveParEcole> {
    const entreeValidee = this.validerEntree(entree);

    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageGarantie = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'GARANTIR_ANNEE_SCOLAIRE_ACTIVE',
        entreeValidee.modifiePar,
        horodatageGarantie,
      );

      const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

      if (ecole === null) {
        throw new ErreurEcoleInvalide(
          "L'ecole dont l'annee active doit etre garantie est introuvable.",
        );
      }

      const anneeActive = await this.depotAnneeScolaire.verrouillerActiveParEcole(
        ecole.obtenirId(),
      );

      if (anneeActive !== null) {
        return {
          anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeActive),
          action: 'EXISTANTE',
        };
      }

      const anneesPlanifiees = await this.depotAnneeScolaire.listerPlanifieesParEcole(
        ecole.obtenirId(),
      );

      if (anneesPlanifiees.length === 1) {
        const anneePlanifiee = anneesPlanifiees[0];

        anneePlanifiee.activer(entreeValidee.modifiePar);
        await this.depotAnneeScolaire.sauvegarder(anneePlanifiee);
        await this.serviceJournalAudit.journaliser({
          action: 'GARANTIR_ANNEE_SCOLAIRE_ACTIVE',
          acteur: entreeValidee.modifiePar,
          typeRessource: 'AnneeScolaire',
          idRessource: anneePlanifiee.obtenirId().obtenirValeur(),
          idEcole: ecole.obtenirId().obtenirValeur(),
          details: {
            actionGarantie: 'PLANIFIEE_ACTIVEE',
            code: anneePlanifiee.obtenirCode(),
            statut: anneePlanifiee.obtenirStatut(),
          },
          creeLe: horodatageGarantie,
        });

        return {
          anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneePlanifiee),
          action: 'PLANIFIEE_ACTIVEE',
        };
      }

      if (anneesPlanifiees.length > 1) {
        throw new ErreurAnneeScolaireInvalide(
          "Plusieurs annees planifiees existent deja pour cette ecole : la garantie automatique serait ambigue.",
        );
      }

      const derniereAnnee = await this.depotAnneeScolaire.trouverDerniereParEcole(
        ecole.obtenirId(),
      );

      if (derniereAnnee !== null) {
        throw new ErreurAnneeScolaireInvalide(
          "Des annees scolaires existent deja sans annee active ni annee planifiee unique.",
        );
      }

      const proposition = this.serviceCycleAnneeScolaire.proposerAnneeCourante(
        entreeValidee.dateReference,
        this.creerSurchargeDates(entreeValidee.dateDebut, entreeValidee.dateFin),
      );
      const anneeCreee = new AnneeScolaire(
        new AnneeScolaireId(),
        ecole.obtenirId(),
        proposition.code,
        proposition.libelle,
        proposition.dateDebut,
        proposition.dateFin,
        entreeValidee.modifiePar,
      );

      anneeCreee.activer(entreeValidee.modifiePar);
      await this.depotAnneeScolaire.sauvegarder(anneeCreee);
      await this.serviceJournalAudit.journaliser({
        action: 'GARANTIR_ANNEE_SCOLAIRE_ACTIVE',
        acteur: entreeValidee.modifiePar,
        typeRessource: 'AnneeScolaire',
        idRessource: anneeCreee.obtenirId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
        details: {
          actionGarantie: 'CREEE_ET_ACTIVEE',
          code: anneeCreee.obtenirCode(),
          statut: anneeCreee.obtenirStatut(),
        },
        creeLe: horodatageGarantie,
      });

      return {
        anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeCreee),
        action: 'CREEE_ET_ACTIVEE',
      };
    });
  }

  private validerEntree(
    entree: GarantirAnneeScolaireActiveParEcoleEntree,
  ): GarantirAnneeScolaireActiveParEcoleEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage GarantirAnneeScolaireActiveParEcole est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
      dateReference: this.validerDateOptionnelle(entree.dateReference, 'dateReference'),
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
