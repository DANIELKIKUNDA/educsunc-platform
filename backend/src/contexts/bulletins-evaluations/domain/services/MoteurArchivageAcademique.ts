import { BulletinEleve } from '../aggregates/BulletinEleve';
import { ProclamationClasse } from '../aggregates/ProclamationClasse';
import { SnapshotResultatBulletin } from '../entities/SnapshotResultatBulletin';
import { ArchivageAcademiqueExecute } from '../events/ArchivageAcademiqueExecute';
import { PolicyArchivageAcademique } from '../policies/PolicyArchivageAcademique';
import { PolicySnapshotAcademique } from '../policies/PolicySnapshotAcademique';

// Ce moteur prepare le figement academique avant archivage.
export class MoteurArchivageAcademique {
  // Cette methode verifie puis prepare l'archivage d'un bulletin.
  public archiverBulletin(
    bulletin: BulletinEleve,
    executePar: string,
  ): ArchivageAcademiqueExecute {
    new PolicyArchivageAcademique().verifierBulletin(
      bulletin.obtenirEtatBulletin(),
    );

    return new ArchivageAcademiqueExecute(
      bulletin.obtenirIdEcole(),
      bulletin.obtenirIdAnneeScolaire(),
      'BULLETIN',
      executePar,
      new Date(),
    );
  }

  // Cette methode verifie puis prepare l'archivage d'une proclamation.
  public archiverProclamation(
    proclamation: ProclamationClasse,
    executePar: string,
  ): ArchivageAcademiqueExecute {
    new PolicyArchivageAcademique().verifierProclamation(
      proclamation.obtenirEtatProclamation(),
    );

    return new ArchivageAcademiqueExecute(
      proclamation.obtenirIdEcole(),
      proclamation.obtenirIdAnneeScolaire(),
      'PROCLAMATION',
      executePar,
      new Date(),
    );
  }

  // Cette methode indique si un snapshot doit etre genere avant archivage.
  public doitGenererSnapshotAvantArchivage(motif: string): boolean {
    return new PolicySnapshotAcademique().doitGenererSnapshot(motif);
  }

  // Cette methode cree un snapshot minimal a partir d'un resultat deja consolide.
  public creerSnapshotResultat(params: ConstructorParameters<typeof SnapshotResultatBulletin>[0]): SnapshotResultatBulletin {
    return new SnapshotResultatBulletin(params);
  }
}
