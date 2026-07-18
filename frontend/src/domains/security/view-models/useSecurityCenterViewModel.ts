import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { notificationsService } from '../../../services/notifications.service';
import { sessionStore } from '../../../shared/auth/session.store';
import type { SecurityAccount, SecurityAffectationCreatePayload, SecurityAdministrator, SecurityAdministratorPayload, SecurityAssignment, SecurityCreateAccountPayload, SecurityGovernanceLevel, SecurityRoleCreatePayload, SecurityRoleDetail, SecurityRoleItem, SecuritySession } from '../models/security.model';
import { securityCenterStore } from '../stores/security-center.store';

export type SecurityTab = 'overview' | 'accounts' | 'administrators' | 'roles' | 'assignments' | 'sessions' | 'attempts' | 'audit';
export type SecurityDialog = 'create-account' | 'account-action' | 'session-action' | 'administrator' | 'create-role' | 'role-action' | 'create-assignment' | 'assignment-action' | null;

const validTabs: readonly SecurityTab[] = ['overview','accounts','administrators','roles','assignments','sessions','attempts','audit'];

export function useSecurityCenterViewModel() {
  const route = useRoute();
  const router = useRouter();
  const selectedTab = ref<SecurityTab>(validTabs.includes(route.query.vue as SecurityTab) ? route.query.vue as SecurityTab : 'overview');
  const search = ref('');
  const statusFilter = ref('ALL');
  const dialog = ref<SecurityDialog>(null);
  const selectedAccount = ref<SecurityAccount | null>(null);
  const selectedSession = ref<SecuritySession | null>(null);
  const selectedAdministrator = ref<SecurityAdministrator | null>(null);
  const selectedRole = ref<SecurityRoleDetail | null>(null);
  const selectedAssignment = ref<SecurityAssignment | null>(null);
  const assignmentWillBeActive = ref(false);
  const roleChange = ref<{ type:'STATE'|'PERMISSION'|'RESTRICTION'; value:string; add:boolean } | null>(null);
  const administratorLevel = ref<'ORGANISATION'|'ECOLE'>('ORGANISATION');
  const administratorMode = ref<'NEW'|'EXISTING'>('NEW');
  const selectedOrganizationId = ref('');
  const selectedSchoolId = ref('');
  const action = ref<'suspend'|'reactivate'|'deactivate'|'unlock'|'reset-password'|'revoke'|'revoke-all'>('suspend');
  const busy = ref(false);
  const auditVisibleLimit = ref(30);
  const reason = ref('');
  const newPassword = ref('');
  const createForm = reactive<SecurityCreateAccountPayload>({
    nomComplet: '', email: '', telephone: '', motDePasseInitial: '', codeRole: 'MANAGER_SYSTEME', motif: '',
  });
  const administratorForm = reactive<SecurityAdministratorPayload>({ motif: '' });
  const roleForm = reactive<SecurityRoleCreatePayload>({ codeRole:'',nomRole:'',description:'',niveauAcces:'PLATEFORME',permissions:[],motif:'' });
  const assignmentForm = reactive<SecurityAffectationCreatePayload>({
    idUtilisateur:'',codeRole:'',niveau:'PLATEFORME',organisationId:undefined,ecoleId:undefined,motif:'',
  });

  const can = (permission: string): boolean => sessionStore.state.permissions.includes(permission);
  const canWriteAccounts = computed(() => can('security.accounts.write'));
  const canManageLifecycle = computed(() => can('security.accounts.lifecycle'));
  const canUnlock = computed(() => can('security.accounts.unlock'));
  const canRevokeSessions = computed(() => can('security.sessions.revoke'));
  const canWriteOrganizationAdministrators = computed(() => can('security.admin.organizations.write'));
  const canEmergencySchoolAdministrators = computed(() => can('security.admin.schools.emergency.write'));
  const canWriteRoles = computed(() => can('roles.write') && can('permissions.write'));
  const canWriteAssignments = computed(() => can('security.assignments.write'));
  const organizationOptions = computed(() => {
    const seen = new Set<string>();
    return securityCenterStore.state.administrationScopes.filter((scope) => {
      if (seen.has(scope.organisationId)) return false;
      seen.add(scope.organisationId); return true;
    });
  });
  const schoolOptions = computed(() => securityCenterStore.state.administrationScopes.filter((scope) => scope.organisationId === selectedOrganizationId.value && scope.ecoleId));
  const assignmentSchoolOptions = computed(() => securityCenterStore.state.administrationScopes.filter((scope) => scope.organisationId === assignmentForm.organisationId && scope.ecoleId));

  const accounts = computed(() => securityCenterStore.state.accounts.filter((item) => {
    const term = search.value.trim().toLocaleLowerCase('fr');
    const matchesTerm = !term || `${item.nomComplet} ${item.email} ${item.affectations.map((entry) => entry.roleLibelle).join(' ')}`.toLocaleLowerCase('fr').includes(term);
    return matchesTerm && (statusFilter.value === 'ALL' || item.etat === statusFilter.value);
  }));
  const sessions = computed(() => securityCenterStore.state.sessions.filter((item) => {
    const term = search.value.trim().toLocaleLowerCase('fr');
    return !term || `${item.nomComplet} ${item.email} ${item.appareil ?? ''} ${item.adresseIp ?? ''}`.toLocaleLowerCase('fr').includes(term);
  }));
  const attempts = computed(() => securityCenterStore.state.attempts.filter((item) => {
    const term = search.value.trim().toLocaleLowerCase('fr');
    const matchesTerm = !term || `${item.nomComplet ?? ''} ${item.email} ${item.adresseIp ?? ''}`.toLocaleLowerCase('fr').includes(term);
    return matchesTerm && (statusFilter.value === 'ALL' || (statusFilter.value === 'SUCCESS') === item.reussie);
  }));
  const filteredAuditEntries = computed(() => securityCenterStore.state.auditEntries.filter((entry) => {
    const term=search.value.trim().toLocaleLowerCase('fr');
    const searchable=[entry.action,entry.motif,entry.auteur_id,entry.cible_id,entry.type_cible,entry.niveau_scope]
      .map((value)=>String(value ?? '')).join(' ').toLocaleLowerCase('fr');
    const matchesStatus=statusFilter.value === 'ALL' || (statusFilter.value === 'SUCCESS') === (entry.succes === true);
    return (!term || searchable.includes(term)) && matchesStatus;
  }));
  const auditEntries = computed(() => filteredAuditEntries.value.slice(0,auditVisibleLimit.value));
  const canLoadMoreAudit = computed(() => auditEntries.value.length < filteredAuditEntries.value.length);

  const activeActorLabel = computed(() => sessionStore.state.actorLabel);
  const isLoading = computed(() => securityCenterStore.state.status === 'loading');
  const hasError = computed(() => securityCenterStore.state.status === 'error');
  const canLoadMoreAccounts = computed(() => Boolean(securityCenterStore.state.nextAccountsCursor));

  watch(selectedTab, (value) => {
    search.value = ''; statusFilter.value = 'ALL'; auditVisibleLimit.value=30;
    void router.replace({ query: { ...route.query, vue: value === 'overview' ? undefined : value } });
  });
  watch(selectedOrganizationId, () => {
    if (administratorLevel.value === 'ECOLE' && !selectedAdministrator.value) {
      selectedSchoolId.value = schoolOptions.value[0]?.ecoleId ?? '';
    }
  });

  async function refresh(): Promise<void> {
    try { await securityCenterStore.loadAll(); }
    catch { notificationsService.danger('Centre indisponible', securityCenterStore.state.errorMessage ?? 'La lecture n’a pas pu être terminée.'); }
  }

  async function loadMoreAccounts(): Promise<void> {
    try { await securityCenterStore.loadMoreAccounts(); }
    catch { notificationsService.danger('Chargement impossible', 'Les comptes suivants ne peuvent pas être affichés pour le moment.'); }
  }

  async function selectRole(role: SecurityRoleItem): Promise<void> {
    try { selectedRole.value=await securityCenterStore.loadRole(role.codeRole); }
    catch { notificationsService.danger('Fiche indisponible','Les informations de cette responsabilité ne peuvent pas être relues pour le moment.'); }
  }

  function openCreateRole(): void {
    Object.assign(roleForm,{codeRole:'',nomRole:'',description:'',niveauAcces:'PLATEFORME',permissions:[],motif:''});
    dialog.value='create-role';
  }

  function openRoleState(active:boolean): void {
    if(!selectedRole.value)return; roleChange.value={type:'STATE',value:active ? 'ACTIVE' : 'INACTIVE',add:active}; reason.value=''; dialog.value='role-action';
  }

  function openRolePermission(change:{value:string;add:boolean}): void {
    if(!selectedRole.value)return; roleChange.value={type:'PERMISSION',...change}; reason.value=''; dialog.value='role-action';
  }

  function openRoleRestriction(change:{value:string;add:boolean}): void {
    if(!selectedRole.value)return; roleChange.value={type:'RESTRICTION',...change}; reason.value=''; dialog.value='role-action';
  }

  function openCreateAccount(): void {
    Object.assign(createForm, { nomComplet: '', email: '', telephone: '', motDePasseInitial: '', codeRole: 'MANAGER_SYSTEME', motif: '' });
    dialog.value = 'create-account';
  }

  function openCreateAssignment(): void {
    const role = securityCenterStore.state.roles.find((item) => item.estActif);
    Object.assign(assignmentForm, {
      idUtilisateur: securityCenterStore.state.accounts.find((item) => item.etat === 'ACTIVE')?.id ?? '',
      codeRole: role?.codeRole ?? '',
      niveau: (role?.niveauAcces ?? 'PLATEFORME') as SecurityGovernanceLevel,
      organisationId: undefined, ecoleId: undefined, motif: '',
    });
    dialog.value='create-assignment';
  }

  function selectAssignmentRole(codeRole:string): void {
    assignmentForm.codeRole=codeRole;
    const role=securityCenterStore.state.roles.find((item)=>item.codeRole===codeRole);
    assignmentForm.niveau=(role?.niveauAcces ?? 'PLATEFORME') as SecurityGovernanceLevel;
    assignmentForm.organisationId=undefined; assignmentForm.ecoleId=undefined;
  }

  function openAssignmentAction(assignment:SecurityAssignment): void {
    selectedAssignment.value=assignment;
    assignmentWillBeActive.value=assignment.etat !== 'ACTIVE';
    reason.value=''; dialog.value='assignment-action';
  }

  function openAccountAction(account: SecurityAccount, nextAction: typeof action.value): void {
    selectedAccount.value = account; action.value = nextAction; reason.value = ''; newPassword.value = ''; dialog.value = 'account-action';
  }

  function openSessionAction(session: SecuritySession, all = false): void {
    selectedSession.value = session; action.value = all ? 'revoke-all' : 'revoke'; reason.value = ''; dialog.value = 'session-action';
  }

  function openAdministratorDialog(level: 'ORGANISATION'|'ECOLE', administrator?: SecurityAdministrator): void {
    administratorLevel.value = level; selectedAdministrator.value = administrator ?? null;
    administratorMode.value = 'NEW'; selectedOrganizationId.value = administrator?.organisationId ?? organizationOptions.value[0]?.organisationId ?? '';
    selectedSchoolId.value = administrator?.ecoleId ?? '';
    Object.assign(administratorForm, { idUtilisateur: undefined, nomComplet: '', email: '', telephone: '', motDePasseInitial: '', motif: '' });
    dialog.value = 'administrator';
  }

  function closeDialog(): void {
    if (busy.value) return;
    dialog.value = null; selectedAccount.value = null; selectedSession.value = null; selectedAdministrator.value = null; selectedAssignment.value=null; roleChange.value=null; reason.value = ''; newPassword.value = '';
  }

  async function submitDialog(): Promise<void> {
    busy.value = true;
    try {
      if (dialog.value === 'create-account') {
        await securityCenterStore.createPlatformAccount({ ...createForm });
        notificationsService.succes('Compte créé', `${createForm.nomComplet} peut maintenant accéder à la plateforme selon son rôle.`);
      } else if (dialog.value === 'create-role') {
        await securityCenterStore.createRole({...roleForm,codeRole:roleForm.codeRole.trim().toUpperCase().replace(/[^A-Z0-9_]/g,'_')});
        notificationsService.succes('Rôle créé','La nouvelle responsabilité est disponible et reste modifiable tant qu’elle est personnalisée.');
      } else if (dialog.value === 'role-action' && selectedRole.value && roleChange.value) {
        if(roleChange.value.type === 'STATE') await securityCenterStore.changeRoleState(selectedRole.value.codeRole,roleChange.value.add,reason.value);
        else if(roleChange.value.type === 'PERMISSION') await securityCenterStore.changeRolePermission(selectedRole.value.codeRole,roleChange.value.value,roleChange.value.add,reason.value);
        else await securityCenterStore.changeRoleRestriction(selectedRole.value.codeRole,roleChange.value.value,roleChange.value.add,reason.value);
        const code=selectedRole.value.codeRole; selectedRole.value=await securityCenterStore.loadRole(code);
        notificationsService.succes('Rôle mis à jour','La décision est enregistrée dans l’historique de sécurité.');
      } else if (dialog.value === 'create-assignment') {
        await securityCenterStore.createAssignment({ ...assignmentForm });
        notificationsService.succes('Affectation créée','Le rôle et son périmètre sont maintenant appliqués au compte sélectionné.');
      } else if (dialog.value === 'assignment-action' && selectedAssignment.value) {
        await securityCenterStore.changeAssignmentState(selectedAssignment.value.idAffectation,assignmentWillBeActive.value,reason.value);
        notificationsService.succes(assignmentWillBeActive.value ? 'Affectation réactivée' : 'Affectation retirée','La décision et son motif sont enregistrés dans l’historique de sécurité.');
      } else if (dialog.value === 'account-action' && selectedAccount.value) {
        if (action.value === 'unlock') await securityCenterStore.unlockAccount(selectedAccount.value.id, reason.value);
        else if (action.value === 'reset-password') await securityCenterStore.resetPassword(selectedAccount.value.id, newPassword.value, reason.value);
        else await securityCenterStore.changeAccountState(selectedAccount.value.id, action.value as 'suspend'|'reactivate'|'deactivate', reason.value || undefined);
        notificationsService.succes('Compte mis à jour', 'La décision est enregistrée et les accès ont été recalculés.');
      } else if (dialog.value === 'session-action' && selectedSession.value) {
        if (action.value === 'revoke-all') await securityCenterStore.revokeAllSessions(selectedSession.value.idUtilisateur, reason.value);
        else await securityCenterStore.revokeSession(selectedSession.value.id, reason.value);
        notificationsService.succes('Session révoquée', action.value === 'revoke-all' ? 'Toutes les connexions de ce compte ont été fermées.' : 'La connexion sélectionnée a été fermée.');
      } else if (dialog.value === 'administrator') {
        const payload: SecurityAdministratorPayload = administratorMode.value === 'EXISTING'
          ? { idUtilisateur: administratorForm.idUtilisateur, motif: administratorForm.motif }
          : { nomComplet: administratorForm.nomComplet, email: administratorForm.email, telephone: administratorForm.telephone, motDePasseInitial: administratorForm.motDePasseInitial, motif: administratorForm.motif };
        if (administratorLevel.value === 'ORGANISATION') {
          if (selectedAdministrator.value) await securityCenterStore.replaceOrganizationAdministrator(selectedOrganizationId.value, selectedAdministrator.value.idAffectation, payload);
          else await securityCenterStore.createOrganizationAdministrator(selectedOrganizationId.value, payload);
        } else {
          if (selectedAdministrator.value) await securityCenterStore.replaceSchoolAdministratorEmergency(selectedOrganizationId.value, selectedSchoolId.value, selectedAdministrator.value.idAffectation, payload);
          else await securityCenterStore.createSchoolAdministratorEmergency(selectedOrganizationId.value, selectedSchoolId.value, payload);
        }
        notificationsService.succes('Administration mise à jour', selectedAdministrator.value ? 'Le remplacement a été effectué dans une opération unique.' : 'Le nouvel administrateur est maintenant affecté au périmètre sélectionné.');
      }
      closeDialog();
    } catch (error) {
      notificationsService.danger('Action impossible', error instanceof Error ? error.message : 'La décision n’a pas pu être enregistrée.');
    } finally { busy.value = false; }
  }

  const dialogTitle = computed(() => {
    if (dialog.value === 'create-account') return 'Créer un compte Plateforme';
    if (dialog.value === 'create-role') return 'Créer un rôle personnalisé';
    if (dialog.value === 'role-action') {
      if(roleChange.value?.type === 'STATE') return roleChange.value.add ? 'Réactiver ce rôle' : 'Désactiver ce rôle';
      if(roleChange.value?.type === 'PERMISSION') return roleChange.value.add ? 'Ajouter une autorisation' : 'Retirer une autorisation';
      return roleChange.value?.add ? 'Ajouter une limitation' : 'Retirer une limitation';
    }
    if (dialog.value === 'create-assignment') return 'Attribuer un rôle et un périmètre';
    if (dialog.value === 'assignment-action') return assignmentWillBeActive.value ? 'Réactiver cette affectation' : 'Retirer cette affectation';
    if (dialog.value === 'administrator') return selectedAdministrator.value ? 'Remplacer un administrateur' : `Ajouter un administrateur ${administratorLevel.value === 'ORGANISATION' ? 'Organisation' : 'École'}`;
    const labels = { suspend:'Suspendre le compte', reactivate:'Réactiver le compte', deactivate:'Désactiver le compte', unlock:'Déverrouiller le compte', 'reset-password':'Réinitialiser le mot de passe', revoke:'Révoquer cette session', 'revoke-all':'Révoquer toutes les sessions' };
    return labels[action.value];
  });
  const requiresReason = computed(() => dialog.value !== 'create-account' && action.value !== 'reactivate');
  const canSubmit = computed(() => {
    if (dialog.value === 'create-account') return Boolean(createForm.nomComplet.trim() && createForm.email.trim() && createForm.motDePasseInitial.length >= 12 && createForm.codeRole);
    if (dialog.value === 'create-role') return Boolean(roleForm.codeRole.trim() && roleForm.nomRole.trim() && roleForm.permissions.length && (roleForm.motif?.trim().length ?? 0) >= 3);
    if (dialog.value === 'create-assignment') {
      const scopeValid=assignmentForm.niveau === 'PLATEFORME' || Boolean(assignmentForm.organisationId && (assignmentForm.niveau !== 'ECOLE' || assignmentForm.ecoleId));
      return Boolean(assignmentForm.idUtilisateur && assignmentForm.codeRole && scopeValid && (assignmentForm.motif?.trim().length ?? 0) >= 3);
    }
    if (dialog.value === 'assignment-action') return reason.value.trim().length >= 3;
    if (dialog.value === 'administrator') {
      const targetValid = Boolean(selectedOrganizationId.value && (administratorLevel.value === 'ORGANISATION' || selectedSchoolId.value));
      const identityValid = administratorMode.value === 'EXISTING' ? Boolean(administratorForm.idUtilisateur) : Boolean(administratorForm.nomComplet?.trim() && administratorForm.email?.trim() && (administratorForm.motDePasseInitial?.length ?? 0) >= 12);
      return targetValid && identityValid && administratorForm.motif.trim().length >= 3;
    }
    if (action.value === 'reset-password') return reason.value.trim().length >= 3 && newPassword.value.length >= 12;
    return !requiresReason.value || reason.value.trim().length >= 3;
  });

  onMounted(refresh);

  return {
    state: securityCenterStore.state, selectedTab, search, statusFilter, dialog, selectedAccount, selectedSession, selectedAdministrator,
    administratorLevel, administratorMode, selectedOrganizationId, selectedSchoolId, administratorForm, organizationOptions, schoolOptions,
    action, reason, newPassword, createForm, busy, accounts, sessions, attempts,auditEntries,auditVisibleLimit,canLoadMoreAudit, activeActorLabel, isLoading, hasError,
    selectedRole,roleChange,roleForm,canWriteRoles,selectedAssignment,assignmentForm,assignmentWillBeActive,assignmentSchoolOptions,canWriteAssignments,
    canWriteAccounts, canManageLifecycle, canUnlock, canRevokeSessions, canWriteOrganizationAdministrators, canEmergencySchoolAdministrators, canLoadMoreAccounts,
    dialogTitle, requiresReason, canSubmit, refresh, loadMoreAccounts,selectRole,openCreateRole,openRoleState,openRolePermission,openRoleRestriction,openCreateAssignment,selectAssignmentRole,openAssignmentAction, openCreateAccount, openAccountAction, openSessionAction, openAdministratorDialog, closeDialog, submitDialog,
  };
}
