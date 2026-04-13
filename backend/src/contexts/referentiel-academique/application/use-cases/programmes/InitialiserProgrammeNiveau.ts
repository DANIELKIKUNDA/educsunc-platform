import { UseCase } from '../../../../../shared/application/UseCase';
import { ProgrammeNiveau } from '../../../domain/aggregates/ProgrammeNiveau';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { MoteurProgrammeLocal } from '../../../domain/services/MoteurProgrammeLocal';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { ReferentielProgrammeId } from '../../../domain/value-objects/ReferentielProgrammeId';
import { StatutProgrammeNiveau } from '../../../domain/value-objects/StatutProgrammeNiveau';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import { InitialiserProgrammeNiveauEntree } from '../../dto/input/InitialiserProgrammeNiveauEntree';
import { ProgrammeNiveauSortie } from '../../dto/output/ProgrammeNiveauSortie';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage InitialiserProgrammeNiveau.
export interface SortieInitialiserProgrammeNiveau {
  programmeNiveau: ProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre l'initialisation d'un programme niveau a partir d'un referentiel officiel.
export class InitialiserProgrammeNiveau
  implements UseCase<InitialiserProgrammeNiveauEntree, SortieInitialiserProgrammeNiveau>
{
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly depotEcole: DepotEcole;
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly moteurProgrammeLocal: MoteurProgrammeLocal;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a l'initialisation du programme niveau.
  constructor(
    depotProgrammeNiveau: DepotProgrammeNiveau,
    depotEcole: DepotEcole,
    depotAnneeScolaire: DepotAnneeScolaire,
    depotClasseAcademique: DepotClasseAcademique,
    depotReferentielProgramme: DepotReferentielProgramme,
    moteurProgrammeLocal: MoteurProgrammeLocal = new MoteurProgrammeLocal(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.depotEcole = depotEcole;
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.depotClasseAcademique = depotClasseAcademique;
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.moteurProgrammeLocal = moteurProgrammeLocal;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode initialise un programme niveau brouillon a partir d'une version officielle de referentiel.
  public async executer(
    entree: InitialiserProgrammeNiveauEntree,
  ): Promise<SortieInitialiserProgrammeNiveau> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageCreation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'INITIALISER_PROGRAMME_NIVEAU',
        entreeValidee.creePar,
        horodatageCreation,
      );

      const ecole = await this.depotEcole.trouverParId(new EcoleId(entreeValidee.idEcole));

      if (ecole === null) {
        throw new ErreurEcoleInvalide(
          "L'ecole cible du programme niveau est introuvable.",
        );
      }

      const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
        new AnneeScolaireId(entreeValidee.idAnneeScolaire),
      );

      if (anneeScolaire === null) {
        throw new ErreurAnneeScolaireInvalide(
          "L'annee scolaire cible du programme niveau est introuvable.",
        );
      }

      if (!anneeScolaire.obtenirEcoleId().estEgal(ecole.obtenirId())) {
        throw new ErreurAnneeScolaireInvalide(
          "L'annee scolaire fournie n'appartient pas a l'ecole cible.",
        );
      }

      const classeAcademique = await this.depotClasseAcademique.trouverParId(
        new ClasseAcademiqueId(entreeValidee.idClasseAcademique),
      );

      if (classeAcademique === null) {
        throw new ErreurClasseAcademiqueInvalide(
          'La classe academique cible du programme niveau est introuvable.',
        );
      }

      const referentielProgramme = await this.depotReferentielProgramme.trouverParId(
        new ReferentielProgrammeId(entreeValidee.idReferentielProgramme),
      );

      if (referentielProgramme === null) {
        throw new ErreurProgrammeInvalide(
          'Le referentiel programme source est introuvable.',
        );
      }

      if (!referentielProgramme.obtenirClasseAcademiqueId().estEgal(classeAcademique.obtenirId())) {
        throw new ErreurProgrammeInvalide(
          'Le referentiel programme fourni ne correspond pas a la classe academique cible.',
        );
      }

      const versionDansReferentiel = referentielProgramme.trouverVersionParId(
        new VersionReferentielProgrammeId(entreeValidee.idVersionReferentielProgramme),
      );

      if (versionDansReferentiel === null) {
        throw new ErreurVersionReferentielInvalide(
          'La version de referentiel fournie ne correspond pas au referentiel programme cible.',
        );
      }

      const programmeNiveau = new ProgrammeNiveau(
        new ProgrammeNiveauId(),
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
        classeAcademique.obtenirId(),
        referentielProgramme.obtenirId(),
        versionDansReferentiel.obtenirId(),
        StatutProgrammeNiveau.BROUILLON,
        [],
        entreeValidee.creePar,
        undefined,
        undefined,
        undefined,
        horodatageCreation,
      );

      this.moteurProgrammeLocal.initialiserDepuisReferentiel(
        programmeNiveau,
        referentielProgramme,
        versionDansReferentiel,
      );

      await this.depotProgrammeNiveau.sauvegarder(programmeNiveau);
      await this.serviceJournalAudit.journaliser({
        action: 'INITIALISER_PROGRAMME_NIVEAU',
        acteur: entreeValidee.creePar,
        typeRessource: 'ProgrammeNiveau',
        idRessource: programmeNiveau.obtenirId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
        details: {
          idAnneeScolaire: anneeScolaire.obtenirId().obtenirValeur(),
          idClasseAcademique: classeAcademique.obtenirId().obtenirValeur(),
          idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
          idVersionReferentielProgramme: versionDansReferentiel.obtenirId().obtenirValeur(),
          statut: programmeNiveau.obtenirStatut(),
        },
        creeLe: horodatageCreation,
      });

      return {
        programmeNiveau: ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau),
      };
    });
  }

  private validerEntree(
    entree: InitialiserProgrammeNiveauEntree,
  ): InitialiserProgrammeNiveauEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeNiveauInvalide(
        "L'entree du cas d'usage InitialiserProgrammeNiveau est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      idClasseAcademique: this.validerTexteObligatoire(entree.idClasseAcademique, 'idClasseAcademique'),
      idReferentielProgramme: this.validerTexteObligatoire(entree.idReferentielProgramme, 'idReferentielProgramme'),
      idVersionReferentielProgramme: this.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
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
}
