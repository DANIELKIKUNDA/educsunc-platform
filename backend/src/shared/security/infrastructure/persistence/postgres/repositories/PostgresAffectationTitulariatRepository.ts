import type { AffectationTitulariatRepositoryPort } from '../../../../application';
import type { AffectationTitulariat } from '../../../../domain';
import { TitulariatPersistenceMapper } from '../mappers';
import { obtenirMemoireSecurityStore } from './_memoireSecurityStore';

// Ce depot persiste les titulariats actifs et historiques.
export class PostgresAffectationTitulariatRepository implements AffectationTitulariatRepositoryPort {
  public async sauvegarder(affectationTitulariat: AffectationTitulariat): Promise<void> {
    const store = obtenirMemoireSecurityStore();
    const record = TitulariatPersistenceMapper.versRecord(affectationTitulariat);
    store.titulariats.set(record.id_affectation_titulariat, record);
  }

  public async trouverActifParClasse(idClasse: string, idAnneeScolaire: string): Promise<AffectationTitulariat | null> {
    const record = Array.from(obtenirMemoireSecurityStore().titulariats.values()).find((titulariat) =>
      titulariat.id_classe === idClasse &&
      titulariat.id_annee_scolaire === idAnneeScolaire &&
      titulariat.est_actif,
    );
    return record ? TitulariatPersistenceMapper.depuisRecord(record) : null;
  }
}
