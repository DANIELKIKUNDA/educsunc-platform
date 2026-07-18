import type {
  AffectationTitulariatRepositoryPort,
  AffectationUtilisateurRepositoryPort,
  ContexteActifRepositoryPort,
  PermissionRepositoryPort,
  RoleRepositoryPort,
} from '../../application';
import type { AffectationTitulariat, AffectationUtilisateur, ContexteActifUtilisateur, Role } from '../../domain';
import {
  AffectationPersistenceMapper,
  ContexteActifPersistenceMapper,
  RolePersistenceMapper,
  TitulariatPersistenceMapper,
} from '../../infrastructure/persistence/postgres/mappers';
import { obtenirMemoireSecurityTest } from './SecurityLegacyMemoryStore';

export class MemoireRoleTestRepository implements RoleRepositoryPort {
  public async sauvegarder(role: Role): Promise<void> {
    const store = obtenirMemoireSecurityTest();
    const record = RolePersistenceMapper.versRecord(role);
    store.roles.set(record.id_role, structuredClone(record));
    store.rolesParCode.set(record.code_role, record.id_role);
  }
  public async trouverParCode(codeRole: string): Promise<Role | null> {
    const store = obtenirMemoireSecurityTest();
    const id = store.rolesParCode.get(codeRole);
    const record = id ? store.roles.get(id) : undefined;
    return record ? RolePersistenceMapper.depuisRecord(structuredClone(record)) : null;
  }
  public async trouverParId(idRole: string): Promise<Role | null> {
    const record = obtenirMemoireSecurityTest().roles.get(idRole);
    return record ? RolePersistenceMapper.depuisRecord(structuredClone(record)) : null;
  }
  public async listerTous(): Promise<readonly Role[]> {
    return [...obtenirMemoireSecurityTest().roles.values()].map((record) => RolePersistenceMapper.depuisRecord(structuredClone(record)));
  }
}

export class MemoirePermissionTestRepository implements PermissionRepositoryPort {
  public async listerPermissionsRole(codeRole: string): Promise<readonly string[]> {
    const role = await new MemoireRoleTestRepository().trouverParCode(codeRole);
    return role?.obtenirPermissions().map((permission) => permission.obtenirPermission().obtenirValeur()) ?? [];
  }
}

export class MemoireAffectationTestRepository implements AffectationUtilisateurRepositoryPort {
  public async sauvegarder(affectation: AffectationUtilisateur): Promise<void> {
    const store = obtenirMemoireSecurityTest();
    const record = AffectationPersistenceMapper.versRecord(affectation);
    store.affectations.set(record.id_affectation_utilisateur, structuredClone(record));
    store.scopes.set(record.id_affectation_utilisateur, structuredClone(record.scopes));
  }
  public async trouverParId(id: string): Promise<AffectationUtilisateur | null> {
    const store = obtenirMemoireSecurityTest();
    const record = store.affectations.get(id);
    return record ? AffectationPersistenceMapper.depuisRecord({ ...structuredClone(record), scopes: structuredClone(store.scopes.get(id) ?? []) }) : null;
  }
  public async listerActivesParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]> {
    const store = obtenirMemoireSecurityTest();
    return [...store.affectations.values()]
      .filter((record) => record.id_utilisateur === idUtilisateur && record.etat_affectation === 'ACTIVE' && (!record.date_fin || new Date(record.date_fin) > new Date()))
      .map((record) => AffectationPersistenceMapper.depuisRecord({ ...structuredClone(record), scopes: structuredClone(store.scopes.get(record.id_affectation_utilisateur) ?? []) }));
  }
  public async listerParUtilisateur(idUtilisateur: string): Promise<readonly AffectationUtilisateur[]> {
    const store = obtenirMemoireSecurityTest();
    return [...store.affectations.values()].filter((record) => record.id_utilisateur === idUtilisateur)
      .map((record) => AffectationPersistenceMapper.depuisRecord({ ...structuredClone(record), scopes: structuredClone(store.scopes.get(record.id_affectation_utilisateur) ?? []) }));
  }
}

export class MemoireTitulariatTestRepository implements AffectationTitulariatRepositoryPort {
  public async sauvegarder(titulariat: AffectationTitulariat): Promise<void> {
    const record = TitulariatPersistenceMapper.versRecord(titulariat);
    obtenirMemoireSecurityTest().titulariats.set(record.id_affectation_titulariat, structuredClone(record));
  }
  public async trouverActifParClasse(idClasse: string, idAnnee: string): Promise<AffectationTitulariat | null> {
    const record = [...obtenirMemoireSecurityTest().titulariats.values()].find((item) => item.id_classe === idClasse && item.id_annee_scolaire === idAnnee && item.est_actif);
    return record ? TitulariatPersistenceMapper.depuisRecord(structuredClone(record)) : null;
  }
  public async listerActifsParUtilisateur(idUtilisateur: string): Promise<readonly AffectationTitulariat[]> {
    return [...obtenirMemoireSecurityTest().titulariats.values()].filter((item) => item.id_utilisateur === idUtilisateur && item.est_actif)
      .map((record) => TitulariatPersistenceMapper.depuisRecord(structuredClone(record)));
  }
}

export class MemoireContexteTestRepository implements ContexteActifRepositoryPort {
  public async sauvegarder(contexte: ContexteActifUtilisateur): Promise<void> {
    const record = ContexteActifPersistenceMapper.versRecord(contexte);
    obtenirMemoireSecurityTest().contextesActifs.set(record.id_utilisateur, structuredClone(record));
  }
  public async trouverParUtilisateur(idUtilisateur: string): Promise<ContexteActifUtilisateur | null> {
    const record = obtenirMemoireSecurityTest().contextesActifs.get(idUtilisateur);
    return record ? ContexteActifPersistenceMapper.depuisRecord(structuredClone(record)) : null;
  }
}
