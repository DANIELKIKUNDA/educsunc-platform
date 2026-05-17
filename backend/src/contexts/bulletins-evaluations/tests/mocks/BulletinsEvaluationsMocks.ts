import type { BulletinPdfPort } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { CacheBulletinPort } from 'contexts/bulletins-evaluations/application/ports/out/CacheBulletinPort';
import type { EnregistrementIdempotence, IdempotencyPort } from 'contexts/bulletins-evaluations/application/ports/out/IdempotencyPort';
import type { EventBusPort } from 'contexts/bulletins-evaluations/application/ports/out/EventBusPort';
import type { OfflineSyncPort } from 'contexts/bulletins-evaluations/application/ports/out/OfflineSyncPort';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from 'contexts/bulletins-evaluations/domain/value-objects/TypeStructureEvaluation';
import type { ProgrammeNiveauDTO, ReferentielAcademiquePort } from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
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

  public async genererBulletinPdf(bulletin: never): Promise<{ nomFichier: string; contenu: Buffer; mimeType: string }> {
    this.dernierBulletin = bulletin;
    return {
      nomFichier: 'bulletin-test.pdf',
      contenu: Buffer.from('PDF TEST'),
      mimeType: 'application/pdf',
    };
  }
}

// Ce faux adaptateur referentiel fournit un programme et des cours stables.
export class ReferentielAcademiquePortMemoire implements ReferentielAcademiquePort {
  public async consulterCours(idReferentielCours: string) {
    return {
      idReferentielCours,
      codeCours: 'MATH',
      libelleCours: 'Mathematiques',
      estCalculable: true,
      aExamen: true,
    };
  }

  public async consulterProgrammeNiveau(idProgrammeNiveau: string): Promise<ProgrammeNiveauDTO | null> {
    return {
      idProgrammeNiveau,
      idClassePedagogique: 'classe-1',
      typeStructureEvaluation: TypeStructureEvaluation.SEMESTRIEL,
      versionReferentielProgramme: 'programme-version-1',
    };
  }

  public async listerCoursProgramme(): Promise<Array<{
    idReferentielCours: string;
    codeCours: string;
    libelleCours: string;
    ordreAffichage: number;
    estCalculable: boolean;
    aExamen: boolean;
  }>> {
    return [
      {
        idReferentielCours: 'cours-1',
        codeCours: 'MATH',
        libelleCours: 'Mathematiques',
        ordreAffichage: 1,
        estCalculable: true,
        aExamen: true,
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
