import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { ClassementClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ClassementClasseReadModel';
import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import type { StatistiquesClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesClasseReadModel';
import type { StatistiquesEcoleReadModel } from 'contexts/bulletins-evaluations/application/read-models/StatistiquesEcoleReadModel';
import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { AuditEncodageReadModel } from 'contexts/bulletins-evaluations/application/queries/AuditEncodageQuery';

// Ce type represente une operation offline stockee localement par l'infrastructure.
export interface OperationOfflinePersistanteBulletin {
  idOperationOffline: string;
  typeOperation: string;
  chargeUtile: Record<string, unknown>;
  dateEnregistrement: Date;
  statut: 'EN_ATTENTE' | 'SYNCHRONISEE' | 'ARCHIVEE';
}

// Ce type represente un snapshot technique d'un bulletin a un instant donne.
export interface SnapshotBulletinPersistant {
  idSnapshot: string;
  idBulletinEleve: string;
  dateSnapshot: Date;
  versionBulletin: number;
  bulletin: BulletinEleveReadModel;
}

// Ce type represente une archive technique d'un document ou d'une projection du BC.
export interface ArchiveBulletinPersistante {
  idArchive: string;
  categorieArchive: string;
  referenceMetier: string;
  contenu: Buffer | string;
  dateArchivage: Date;
}

// Cette structure centralise le stockage local simule de toute l'infrastructure bulletin.
const memoireTechniqueBulletins = {
  auditsEncodage: new Map<string, AuditEncodageReadModel[]>(),
  projectionsBulletins: new Map<string, BulletinEleveReadModel>(),
  projectionsClassements: new Map<string, ClassementClasseReadModel>(),
  projectionsProclamations: new Map<string, ProclamationClasseReadModel>(),
  projectionsSyntheses: new Map<string, SyntheseEcoleOutput>(),
  projectionsStatistiques: new Map<string, StatistiquesClasseReadModel | StatistiquesEcoleReadModel>(),
  operationsOffline: new Map<string, OperationOfflinePersistanteBulletin>(),
  snapshotsBulletins: new Map<string, SnapshotBulletinPersistant>(),
  archivesBulletins: new Map<string, ArchiveBulletinPersistante>(),
  journauxProjection: new Map<string, Date>(),
};

// Cette fonction expose la memoire technique locale partagee par les depots et services.
export function obtenirMemoireTechniqueBulletins() {
  return memoireTechniqueBulletins;
}

// Cette fonction relit une propriete texte sans ouvrir le modele publicement.
export function lireTexte(objet: object, propriete: string): string {
  return String(Reflect.get(objet, propriete) ?? '');
}

// Cette fonction relit une propriete numerique en appliquant une valeur de secours.
export function lireNombre(objet: object, propriete: string, valeurParDefaut = 0): number {
  const valeur = Reflect.get(objet, propriete);
  return typeof valeur === 'number' && Number.isFinite(valeur) ? valeur : valeurParDefaut;
}

// Cette fonction relit une propriete booleenne sans exposer la classe source.
export function lireBooleen(objet: object, propriete: string, valeurParDefaut = false): boolean {
  const valeur = Reflect.get(objet, propriete);
  return typeof valeur === 'boolean' ? valeur : valeurParDefaut;
}

// Cette fonction relit une collection privee sans exposer le modele en public.
export function lireTableau<TElement>(objet: object, propriete: string): TElement[] {
  const valeur = Reflect.get(objet, propriete);
  return Array.isArray(valeur) ? [...valeur] as TElement[] : [];
}

// Cette fonction relit une date interne si elle existe deja.
export function lireDate(objet: object, propriete: string): Date | undefined {
  const valeur = Reflect.get(objet, propriete);
  return valeur instanceof Date ? valeur : undefined;
}
