import { BulletinMapper } from '../mappers/BulletinMapper';
import { ClassementMapper } from '../mappers/ClassementMapper';
import { FicheCotationMapper } from '../mappers/FicheCotationMapper';
import { MigrationMapper } from '../mappers/MigrationMapper';
import { ProclamationMapper } from '../mappers/ProclamationMapper';
import { ResultatBulletinMapper } from '../mappers/ResultatBulletinMapper';
import { SyntheseMapper } from '../mappers/SyntheseMapper';
import type { BulletinEleve } from '../../domain/aggregates/BulletinEleve';
import type { ClassementColonneClasse } from '../../domain/aggregates/ClassementColonneClasse';
import type { FicheCotationEleveCours } from '../../domain/aggregates/FicheCotationEleveCours';
import type { MigrationBulletin } from '../../domain/aggregates/MigrationBulletin';
import type { ProclamationClasse } from '../../domain/aggregates/ProclamationClasse';
import type { ResultatBulletinEleve } from '../../domain/aggregates/ResultatBulletinEleve';
import type { SyntheseResultatsEcole } from '../../domain/aggregates/SyntheseResultatsEcole';

// Ce service centralise les projections de domaine vers DTO de lecture.
export class ServiceProjectionLecture {
  constructor(
    private readonly bulletinMapper = new BulletinMapper(),
    private readonly ficheMapper = new FicheCotationMapper(),
    private readonly resultatMapper = new ResultatBulletinMapper(),
    private readonly classementMapper = new ClassementMapper(),
    private readonly proclamationMapper = new ProclamationMapper(),
    private readonly syntheseMapper = new SyntheseMapper(),
    private readonly migrationMapper = new MigrationMapper(),
  ) {}

  // Cette methode projette un bulletin.
  public projeterBulletin(bulletin: BulletinEleve) {
    return this.bulletinMapper.versSortie(bulletin);
  }

  // Cette methode projette une fiche de cotation.
  public projeterFiche(fiche: FicheCotationEleveCours) {
    return this.ficheMapper.versSortie(fiche);
  }

  // Cette methode projette un resultat consolide.
  public projeterResultat(resultat: ResultatBulletinEleve) {
    return this.resultatMapper.versSortie(resultat);
  }

  // Cette methode projette un classement.
  public projeterClassement(classement: ClassementColonneClasse) {
    return this.classementMapper.versSortie(classement);
  }

  // Cette methode projette une proclamation.
  public projeterProclamation(proclamation: ProclamationClasse) {
    return this.proclamationMapper.versSortie(proclamation);
  }

  // Cette methode projette une synthese.
  public projeterSynthese(synthese: SyntheseResultatsEcole) {
    return this.syntheseMapper.versSortie(synthese);
  }

  // Cette methode projette une migration.
  public projeterMigration(migration: MigrationBulletin) {
    return this.migrationMapper.versSortie(migration);
  }
}
