import { AnalyserMigrationReferentielEntree } from '../dto/input/AnalyserMigrationReferentielEntree';
import { AppliquerMigrationReferentielEntree } from '../dto/input/AppliquerMigrationReferentielEntree';
import { DemandeTransformationNoteEntree } from '../dto/input/DemandeTransformationNoteEntree';
import { ProgrammeNiveauSortie } from '../dto/output/ProgrammeNiveauSortie';
import { RapportMigrationSortie } from '../dto/output/RapportMigrationSortie';
import { VersionReferentielProgrammeSortie } from '../dto/output/VersionReferentielProgrammeSortie';
import { ErreurUseCaseInvalide } from '../exceptions/ErreurUseCaseInvalide';
import { OrchestrateurMigrationReferentiel } from '../services/OrchestrateurMigrationReferentiel';
import { OrchestrateurSynchronisationReferentiel } from '../services/OrchestrateurSynchronisationReferentiel';
import { SortieComparerDeuxVersionsReferentiel } from '../use-cases/referentiels/ComparerDeuxVersionsReferentiel';
import { MigrationReferentielProgrammeSortie } from '../dto/output/MigrationReferentielProgrammeSortie';

// Cette interface definit la dependance de chargement d'un programme niveau pour la saga.
export interface ChargeurProgrammeNiveauSagaMigrationReferentiel {
  // Cette methode charge le programme niveau cible de la migration.
  chargerProgrammeNiveau(idProgrammeNiveau: string): Promise<ProgrammeNiveauSortie | null>;
}

// Cette interface definit la dependance de chargement d'une version officielle pour la saga.
export interface ChargeurVersionReferentielProgrammeSagaMigrationReferentiel {
  // Cette methode charge une version officielle de referentiel programme.
  chargerVersionReferentielProgramme(
    idVersionReferentielProgramme: string,
  ): Promise<VersionReferentielProgrammeSortie | null>;
}

// Cette interface represente la demande d'activation de la nouvelle version locale.
export interface DemandeActivationVersionLocaleSagaMigrationReferentiel {
  idProgrammeNiveau: string;
  idNouvelleVersionReferentiel: string;
  activePar: string;
}

// Cette interface definit la dependance d'activation de la nouvelle version locale apres migration.
export interface ActiveurVersionLocaleSagaMigrationReferentiel {
  // Cette methode active la nouvelle version locale cible apres l'application de la migration.
  activerNouvelleVersionLocale(
    demande: DemandeActivationVersionLocaleSagaMigrationReferentiel,
  ): Promise<void>;
}

// Cette interface represente l'entree de la saga de migration de referentiel.
export interface EntreeSagaMigrationReferentiel {
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
  declenchePar: string;
  demandesTransformationNotes?: readonly DemandeTransformationNoteEntree[];
  relancerRecalculSiNecessaire?: boolean;
}

// Cette interface represente la sortie de la saga de migration de referentiel.
export interface SortieSagaMigrationReferentiel {
  programmeNiveau: ProgrammeNiveauSortie;
  ancienneVersionReferentiel: VersionReferentielProgrammeSortie;
  nouvelleVersionReferentiel: VersionReferentielProgrammeSortie;
  comparaison: SortieComparerDeuxVersionsReferentiel;
  rapportAnalyse: RapportMigrationSortie;
  migrationAppliquee: MigrationReferentielProgrammeSortie;
  programmeNiveauMisAJour: ProgrammeNiveauSortie;
  recalculRelance: boolean;
  versionLocaleActivee: boolean;
}

// Cette saga orchestre le workflow complet de migration d'un referentiel programme.
export class SagaMigrationReferentiel {
  private readonly chargeurProgrammeNiveau: ChargeurProgrammeNiveauSagaMigrationReferentiel;
  private readonly chargeurVersionReferentielProgramme: ChargeurVersionReferentielProgrammeSagaMigrationReferentiel;
  private readonly orchestrateurMigrationReferentiel: OrchestrateurMigrationReferentiel;
  private readonly orchestrateurSynchronisationReferentiel: OrchestrateurSynchronisationReferentiel;
  private readonly activeurVersionLocale: ActiveurVersionLocaleSagaMigrationReferentiel;

  // Ce constructeur injecte les dependances du workflow de migration de referentiel.
  constructor(
    chargeurProgrammeNiveau: ChargeurProgrammeNiveauSagaMigrationReferentiel,
    chargeurVersionReferentielProgramme: ChargeurVersionReferentielProgrammeSagaMigrationReferentiel,
    orchestrateurMigrationReferentiel: OrchestrateurMigrationReferentiel,
    orchestrateurSynchronisationReferentiel: OrchestrateurSynchronisationReferentiel,
    activeurVersionLocale: ActiveurVersionLocaleSagaMigrationReferentiel,
  ) {
    this.chargeurProgrammeNiveau = chargeurProgrammeNiveau;
    this.chargeurVersionReferentielProgramme = chargeurVersionReferentielProgramme;
    this.orchestrateurMigrationReferentiel = orchestrateurMigrationReferentiel;
    this.orchestrateurSynchronisationReferentiel = orchestrateurSynchronisationReferentiel;
    this.activeurVersionLocale = activeurVersionLocale;
  }

  // Cette methode execute les etapes documentaires completes de la migration de referentiel.
  public async executer(
    entree: EntreeSagaMigrationReferentiel,
  ): Promise<SortieSagaMigrationReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    const programmeNiveau = await this.chargeurProgrammeNiveau.chargerProgrammeNiveau(
      entreeValidee.idProgrammeNiveau,
    );

    if (programmeNiveau === null) {
      throw new ErreurUseCaseInvalide(
        "Le programme niveau cible de la saga de migration est introuvable.",
      );
    }

    const ancienneVersionReferentiel = await this.chargerVersionReferentielObligatoire(
      entreeValidee.idAncienneVersionReferentiel,
      'ancienne',
    );
    const nouvelleVersionReferentiel = await this.chargerVersionReferentielObligatoire(
      entreeValidee.idNouvelleVersionReferentiel,
      'nouvelle',
    );

    const comparaison = await this.orchestrateurSynchronisationReferentiel.comparerDeuxVersionsReferentiel({
      idClasseAcademique: programmeNiveau.idClasseAcademique,
      versionReferentielSource: ancienneVersionReferentiel.codeVersion,
      versionReferentielCible: nouvelleVersionReferentiel.codeVersion,
    });

    const rapportAnalyse = await this.analyserMigration({
      idProgrammeNiveau: programmeNiveau.id,
      idAncienneVersionReferentiel: ancienneVersionReferentiel.id,
      idNouvelleVersionReferentiel: nouvelleVersionReferentiel.id,
      declenchePar: entreeValidee.declenchePar,
    });

    const idMigration = rapportAnalyse.migrationReferentielProgramme.id;
    const recalculRelance = await this.relancerRecalculSiNecessaire(
      idMigration,
      entreeValidee.declenchePar,
      entreeValidee.relancerRecalculSiNecessaire ?? false,
      comparaison,
    );

    const resultatApplication = await this.appliquerMigration({
      idMigrationReferentielProgramme: idMigration,
      demandesTransformationNotes: entreeValidee.demandesTransformationNotes?.map(
        (demandeTransformationNote) => ({ ...demandeTransformationNote }),
      ),
      appliquePar: entreeValidee.declenchePar,
    });

    await this.activeurVersionLocale.activerNouvelleVersionLocale({
      idProgrammeNiveau: programmeNiveau.id,
      idNouvelleVersionReferentiel: nouvelleVersionReferentiel.id,
      activePar: entreeValidee.declenchePar,
    });

    return {
      programmeNiveau,
      ancienneVersionReferentiel,
      nouvelleVersionReferentiel,
      comparaison,
      rapportAnalyse,
      migrationAppliquee: resultatApplication.migrationReferentielProgramme,
      programmeNiveauMisAJour: resultatApplication.programmeNiveau,
      recalculRelance,
      versionLocaleActivee: true,
    };
  }

  // Cette methode delegue l'analyse initiale de la migration a l'orchestrateur applicatif.
  private async analyserMigration(
    entree: AnalyserMigrationReferentielEntree,
  ): Promise<RapportMigrationSortie> {
    const resultat = await this.orchestrateurMigrationReferentiel.analyserMigrationReferentiel(entree);

    return resultat.rapportMigration;
  }

  // Cette methode delegue l'application effective de la migration a l'orchestrateur applicatif.
  private appliquerMigration(
    entree: AppliquerMigrationReferentielEntree,
  ) {
    return this.orchestrateurMigrationReferentiel.appliquerMigrationReferentiel(entree);
  }

  // Cette methode charge et verifie qu'une version officielle necessaire a la saga existe.
  private async chargerVersionReferentielObligatoire(
    idVersionReferentielProgramme: string,
    qualificationVersion: 'ancienne' | 'nouvelle',
  ): Promise<VersionReferentielProgrammeSortie> {
    const versionReferentielProgramme = await this.chargeurVersionReferentielProgramme
      .chargerVersionReferentielProgramme(idVersionReferentielProgramme);

    if (versionReferentielProgramme === null) {
      throw new ErreurUseCaseInvalide(
        `La version officielle ${qualificationVersion} necessaire a la migration est introuvable.`,
      );
    }

    return versionReferentielProgramme;
  }

  // Cette methode relance le recalcul seulement lorsque la saga l'exige et que des differences existent.
  private async relancerRecalculSiNecessaire(
    idMigrationReferentielProgramme: string,
    declenchePar: string,
    relancerRecalculSiNecessaire: boolean,
    comparaison: SortieComparerDeuxVersionsReferentiel,
  ): Promise<boolean> {
    if (!relancerRecalculSiNecessaire || comparaison.differences.length === 0) {
      return false;
    }

    await this.orchestrateurMigrationReferentiel.relancerRecalculApresMigration({
      idMigrationReferentielProgramme,
      relancePar: declenchePar,
    });

    return true;
  }

  // Cette methode valide l'entree de la saga et normalise les donnees textuelles attendues.
  private validerEntree(
    entree: EntreeSagaMigrationReferentiel,
  ): EntreeSagaMigrationReferentiel {
    if (entree === null || entree === undefined) {
      throw new ErreurUseCaseInvalide(
        "L'entree de la saga de migration de referentiel est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
      idAncienneVersionReferentiel: this.validerTexteObligatoire(
        entree.idAncienneVersionReferentiel,
        'idAncienneVersionReferentiel',
      ),
      idNouvelleVersionReferentiel: this.validerTexteObligatoire(
        entree.idNouvelleVersionReferentiel,
        'idNouvelleVersionReferentiel',
      ),
      declenchePar: this.validerTexteObligatoire(entree.declenchePar, 'declenchePar'),
      demandesTransformationNotes: this.validerDemandesTransformationNotes(
        entree.demandesTransformationNotes,
      ),
      relancerRecalculSiNecessaire: entree.relancerRecalculSiNecessaire === true,
    };
  }

  // Cette methode valide la liste eventuelle des transformations de notes transmises a la saga.
  private validerDemandesTransformationNotes(
    demandesTransformationNotes?: readonly DemandeTransformationNoteEntree[],
  ): readonly DemandeTransformationNoteEntree[] | undefined {
    if (demandesTransformationNotes === undefined) {
      return undefined;
    }

    if (!Array.isArray(demandesTransformationNotes)) {
      throw new ErreurUseCaseInvalide(
        'Les demandes de transformation de notes doivent etre fournies sous forme de liste.',
      );
    }

    return demandesTransformationNotes.map((demandeTransformationNote, indexDemande) => ({
      idNote: this.validerTexteObligatoire(
        demandeTransformationNote.idNote,
        `demandesTransformationNotes[${indexDemande}].idNote`,
      ),
      ancienneValeur: this.validerNombreEntierPositifOuNul(
        demandeTransformationNote.ancienneValeur,
        `demandesTransformationNotes[${indexDemande}].ancienneValeur`,
      ),
      ancienMaximum: this.validerNombreEntierStrictementPositif(
        demandeTransformationNote.ancienMaximum,
        `demandesTransformationNotes[${indexDemande}].ancienMaximum`,
      ),
      nouveauMaximum: this.validerNombreEntierStrictementPositif(
        demandeTransformationNote.nouveauMaximum,
        `demandesTransformationNotes[${indexDemande}].nouveauMaximum`,
      ),
    }));
  }

  // Cette methode valide un champ textuel obligatoire utilise par la saga.
  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurUseCaseInvalide(`Le champ "${nomChamp}" est obligatoire.`);
    }

    return valeurNettoyee;
  }

  // Cette methode valide un entier strictement positif attendu par une transformation de note.
  private validerNombreEntierStrictementPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  // Cette methode valide un entier positif ou nul attendu par une transformation de note.
  private validerNombreEntierPositifOuNul(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur < 0) {
      throw new ErreurUseCaseInvalide(
        `Le champ "${nomChamp}" doit etre un entier positif ou nul.`,
      );
    }

    return valeur;
  }
}
