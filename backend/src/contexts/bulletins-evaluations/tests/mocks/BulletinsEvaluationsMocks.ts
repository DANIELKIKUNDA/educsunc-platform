import type { BulletinPdfPort } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { AutorisationGenerationBulletinPort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationBulletinPort';
import type { AutorisationClassementPort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationClassementPort';
import type { AutorisationConduitePort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationConduitePort';
import type { AutorisationGenerationProclamationPort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationProclamationPort';
import type { AutorisationConsultationStatistiquesPort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationConsultationStatistiquesPort';
import type { AutorisationGenerationSynthesePort } from 'contexts/bulletins-evaluations/application/ports/out/AutorisationGenerationSynthesePort';
import type { CacheBulletinPort } from 'contexts/bulletins-evaluations/application/ports/out/CacheBulletinPort';
import type { ClockPort } from 'contexts/bulletins-evaluations/application/ports/out/ClockPort';
import type {
  FenetreEncodageCalendrierPort,
  FenetreEncodageCalendrierReadModel,
} from 'contexts/bulletins-evaluations/application/ports/out/FenetreEncodageCalendrierPort';
import type { EnregistrementIdempotence, IdempotencyPort } from 'contexts/bulletins-evaluations/application/ports/out/IdempotencyPort';
import type { EventBusPort } from 'contexts/bulletins-evaluations/application/ports/out/EventBusPort';
import type { OfflineSyncPort } from 'contexts/bulletins-evaluations/application/ports/out/OfflineSyncPort';
import type { CriteresAnalysePedagogiquePort } from 'contexts/bulletins-evaluations/application/ports/out/CriteresAnalysePedagogiquePort';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { CriteresAnalysePedagogique } from 'contexts/bulletins-evaluations/domain/entities/CriteresAnalysePedagogique';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type {
  ProgrammeNiveauDTO,
  ReferenceProgrammeNiveauDTO,
  ReferentielAcademiquePort,
} from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type { TransactionManagerPort } from 'contexts/bulletins-evaluations/application/ports/out/TransactionManagerPort';
import type { ServiceCache } from 'shared/infrastructure/cache/CacheService';

// Ce fichier regroupe des doubles de test simples pour les ports applicatifs et shared.
export class TransactionManagerMemoire implements TransactionManagerPort {
  public nombreTransactions = 0;

  public async executer<T>(operation: () => Promise<T>): Promise<T> {
    this.nombreTransactions += 1;
    return operation();
  }
}

// Ce faux bus d'evenements memorise tout ce qui est publie.
export class EventBusMemoire implements EventBusPort {
  public evenementsPublies: unknown[] = [];

  public async publier(evenements: unknown[]): Promise<void> {
    this.evenementsPublies.push(...evenements);
  }
}

// Cette fausse horloge fixe permet de piloter la date metier pendant les tests.
export class HorlogeFixeMemoire implements ClockPort {
  constructor(private readonly dateFixe: Date) {}

  public maintenant(): Date {
    return new Date(this.dateFixe.getTime());
  }
}

// Ce faux store idempotent conserve les sorties dans une map en memoire.
export class IdempotencyPortMemoire<TSortie> implements IdempotencyPort<TSortie> {
  private stockage = new Map<string, EnregistrementIdempotence<TSortie>>();

  public async trouver(cleIdempotence: string): Promise<EnregistrementIdempotence<TSortie> | null> {
    return this.stockage.get(cleIdempotence) ?? null;
  }

  public async enregistrer(cleIdempotence: string, empreintePayload: string, sortie: TSortie): Promise<void> {
    this.stockage.set(cleIdempotence, { cleIdempotence, empreintePayload, sortie });
  }
}

// Ce faux cache shared permet de tester les adaptateurs et services de cache.
export class CacheMemoire implements CacheBulletinPort, ServiceCache {
  private stockage = new Map<string, unknown>();

  public async obtenir<T>(cle: string): Promise<T | null> {
    return (this.stockage.get(cle) as T | undefined) ?? null;
  }

  public async enregistrer<T>(cle: string, valeur: T): Promise<void> {
    this.stockage.set(cle, valeur);
  }

  public async invalider(cle: string): Promise<void> {
    this.stockage.delete(cle);
  }

  public async recuperer(cle: string): Promise<unknown | null> {
    return this.stockage.get(cle) ?? null;
  }

  public async supprimer(cle: string): Promise<void> {
    this.stockage.delete(cle);
  }
}

// Ce faux adaptateur PDF enregistre les demandes sans acceder a une vraie bibliotheque.
export class PdfPortMemoire implements BulletinPdfPort {
  public dernierBulletin: unknown = null;

  public async genererBulletinPdf(bulletin: unknown): Promise<{ nomFichier: string; contenu: Buffer; mimeType: string }> {
    this.dernierBulletin = bulletin;
    return {
      nomFichier: 'bulletin-test.pdf',
      contenu: Buffer.from('PDF TEST'),
      mimeType: 'application/pdf',
    };
  }
}

// Ce faux adaptateur d'autorisation permet de verifier localement les controles de generation.
export class AutorisationGenerationBulletinPortMemoire implements AutorisationGenerationBulletinPort {
  public dernierContexte:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  constructor(private readonly erreur?: Error) {}

  public async verifierGenerationBulletin(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexte = params;

    if (this.erreur) {
      throw this.erreur;
    }
  }
}

// Ce faux adaptateur permet de verifier localement les controles de lecture et recalcul de classement.
export class AutorisationClassementPortMemoire implements AutorisationClassementPort {
  public dernierContexteConsultation:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  public dernierContexteRecalcul:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  constructor(
    private readonly erreurConsultation?: Error,
    private readonly erreurRecalcul?: Error,
  ) {}

  public async verifierConsultationClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteConsultation = params;

    if (this.erreurConsultation) {
      throw this.erreurConsultation;
    }
  }

  public async verifierRecalculClassementClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteRecalcul = params;

    if (this.erreurRecalcul) {
      throw this.erreurRecalcul;
    }
  }
}

// Ce faux adaptateur permet de verifier localement les controles d'encodage de conduite.
export class AutorisationConduitePortMemoire implements AutorisationConduitePort {
  public dernierContexte:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  constructor(private readonly erreur?: Error) {}

  public async verifierEncodageConduite(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexte = params;

    if (this.erreur) {
      throw this.erreur;
    }
  }
}

// Ce faux adaptateur d'autorisation permet de verifier localement les controles d'initialisation et de generation de proclamation.
export class AutorisationGenerationProclamationPortMemoire implements AutorisationGenerationProclamationPort {
  public dernierContexteInitialisation:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  public dernierContexteGeneration:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  constructor(
    private readonly erreurInitialisation?: Error,
    private readonly erreurGeneration?: Error,
  ) {}

  public async verifierInitialisationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteInitialisation = params;

    if (this.erreurInitialisation) {
      throw this.erreurInitialisation;
    }
  }

  public async verifierGenerationProclamation(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteGeneration = params;

    if (this.erreurGeneration) {
      throw this.erreurGeneration;
    }
  }
}

// Ce faux adaptateur d'autorisation permet de verifier localement les controles de generation de synthese.
export class AutorisationGenerationSynthesePortMemoire implements AutorisationGenerationSynthesePort {
  public dernierContexteInitialisation:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idAnneeScolaire: string;
      idClassesPedagogiques: string[];
    }
    | null = null;

  public dernierContexte:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idAnneeScolaire: string;
      idClassesPedagogiques: string[];
    }
    | null = null;

  constructor(
    private readonly erreurGeneration?: Error,
    private readonly erreurInitialisation?: Error,
  ) {}

  public async verifierInitialisationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void> {
    this.dernierContexteInitialisation = {
      ...params,
      idClassesPedagogiques: [...params.idClassesPedagogiques],
    };

    if (this.erreurInitialisation) {
      throw this.erreurInitialisation;
    }
  }

  public async verifierGenerationSynthese(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
    idClassesPedagogiques: string[];
  }): Promise<void> {
    this.dernierContexte = {
      ...params,
      idClassesPedagogiques: [...params.idClassesPedagogiques],
    };

    if (this.erreurGeneration) {
      throw this.erreurGeneration;
    }
  }
}

// Ce faux adaptateur permet de verifier localement les acces statistiques classe et ecole.
export class AutorisationConsultationStatistiquesPortMemoire implements AutorisationConsultationStatistiquesPort {
  public dernierContexteClasse:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }
    | null = null;

  public dernierContexteEcole:
    | {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idAnneeScolaire: string;
    }
    | null = null;

  constructor(
    private readonly erreurClasse?: Error,
    private readonly erreurEcole?: Error,
  ) {}

  public async verifierConsultationStatistiquesClasse(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteClasse = params;

    if (this.erreurClasse) {
      throw this.erreurClasse;
    }
  }

  public async verifierConsultationStatistiquesEcole(params: {
    idUtilisateur: string;
    idOrganisation?: string;
    idEcole: string;
    idAnneeScolaire: string;
  }): Promise<void> {
    this.dernierContexteEcole = params;

    if (this.erreurEcole) {
      throw this.erreurEcole;
    }
  }
}

// Ce faux port calendrier expose une fenetre temporelle deterministe pour les tests d'encodage.
export class FenetreEncodageCalendrierPortMemoire implements FenetreEncodageCalendrierPort {
  public dernierContexte:
    | {
      idEcole: string;
      idAnneeScolaire: string;
      codeColonne: CodeColonneBulletin;
      dateReference: Date;
    }
    | null = null;

  constructor(
    private readonly fenetreCalendrier: FenetreEncodageCalendrierReadModel | null,
  ) {}

  public async determinerFenetreEncodage(params: {
    idEcole: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    dateReference: Date;
  }): Promise<FenetreEncodageCalendrierReadModel | null> {
    this.dernierContexte = {
      ...params,
      dateReference: new Date(params.dateReference.getTime()),
    };
    return this.fenetreCalendrier;
  }
}

// Ce faux port fournit des criteres pedagogiques deterministes aux tests.
export class CriteresAnalysePedagogiquePortMemoire implements CriteresAnalysePedagogiquePort {
  public dernierContexte:
    | {
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
      idProgrammeNiveau: string;
    }
    | null = null;

  constructor(private readonly criteres = CriteresAnalysePedagogique.parDefaut()) {}

  public async resoudreCriteresAnalysePedagogique(params: {
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    idProgrammeNiveau: string;
  }): Promise<CriteresAnalysePedagogique> {
    this.dernierContexte = params;
    return this.criteres;
  }
}

// Ce faux adaptateur referentiel fournit un programme et des cours stables.
export class ReferentielAcademiquePortMemoire implements ReferentielAcademiquePort {
  public derniereReferenceProgrammeConsultee: ReferenceProgrammeNiveauDTO | null = null;
  public derniereReferenceCoursProgramme: ReferenceProgrammeNiveauDTO | null = null;

  public async consulterCours(idReferentielCours: string) {
    return {
      idReferentielCours,
      codeCours: 'MATH',
      libelleCours: 'Mathematiques',
      estCalculable: true,
      aExamen: true,
    };
  }

  public async consulterProgrammeNiveau(referenceProgramme: ReferenceProgrammeNiveauDTO): Promise<ProgrammeNiveauDTO | null> {
    this.derniereReferenceProgrammeConsultee = referenceProgramme;

    return {
      idProgrammeNiveau: referenceProgramme.idProgrammeNiveau,
      idClassePedagogique: 'classe-1',
      typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
      versionReferentielProgramme: 'version-ref-1',
      statutProgrammeNiveau: 'VALIDE',
    };
  }

  public async listerCoursProgramme(referenceProgramme: ReferenceProgrammeNiveauDTO): Promise<Array<{
    idReferentielCours: string;
    codeCours: string;
    libelleCours: string;
    ordreAffichage: number;
    estCalculable: boolean;
    aExamen: boolean;
    domaine?: string;
    sousDomaine?: string;
  }>> {
    this.derniereReferenceCoursProgramme = referenceProgramme;

    return [
      {
        idReferentielCours: 'cours-1',
        codeCours: 'MATH',
        libelleCours: 'Mathematiques',
        ordreAffichage: 1,
        estCalculable: true,
        aExamen: true,
        domaine: 'Sciences',
        sousDomaine: 'Mathematiques',
      },
    ];
  }

  public async listerColonnesAutorisees(typeStructureEvaluation: TypeStructureEvaluation): Promise<CodeColonneBulletin[]> {
    return typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL
      ? [CodeColonneBulletin.P1, CodeColonneBulletin.P2, CodeColonneBulletin.EX1, CodeColonneBulletin.TOTAL_GENERAL]
      : [CodeColonneBulletin.P1, CodeColonneBulletin.P2, CodeColonneBulletin.EX1, CodeColonneBulletin.TOTAL_T1];
  }
}

// Ce faux adaptateur de synchronisation conserve les operations recues.
export class OfflineSyncPortMemoire implements OfflineSyncPort {
  public operations: unknown[] = [];

  public async enregistrerOperation(operation: unknown): Promise<void> {
    this.operations.push(operation);
  }

  public async synchroniser(operation: unknown): Promise<{ statut: 'SUCCES' | 'CONFLIT'; operation: unknown }> {
    this.operations.push(operation);
    return { statut: 'SUCCES', operation };
  }

  public async marquerOperationSynchronisee(idOperationOffline: string): Promise<void> {
    this.operations.push({ idOperationOffline, statut: 'SYNCHRONISEE' });
  }
}
