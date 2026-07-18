<template>
  <main class="security-center">
    <PageHeader eyebrow="Gouvernance Plateforme" title="Centre Sécurité" description="Gouvernez les comptes, les accès et les connexions de la plateforme depuis un espace unique et traçable.">
      <template #actions><button class="security-button security-button--secondary" type="button" :disabled="vm.isLoading.value" @click="vm.refresh"><RefreshCw :size="17" /> Actualiser</button></template>
    </PageHeader>

    <section class="security-hero" aria-label="Contexte de sécurité">
      <div><span>Plateforme EduSync</span><h2>Une gouvernance claire, du compte jusqu’au périmètre</h2><p>Connecté comme {{ vm.activeActorLabel.value }}. Les décisions sensibles sont contrôlées côté serveur et inscrites dans l’historique.</p></div>
      <ShieldCheck :size="42" aria-hidden="true" />
    </section>

    <LoadingState v-if="vm.isLoading.value && vm.state.status !== 'ready'" title="Chargement du Centre Sécurité" message="Nous préparons les comptes, accès et connexions utiles." />
    <ErrorState v-else-if="vm.hasError.value" title="Centre temporairement indisponible" :message="vm.state.errorMessage ?? 'La lecture n’a pas pu être terminée.'">
      <template #actions><button class="security-button" type="button" @click="vm.refresh">Réessayer</button></template>
    </ErrorState>
    <template v-else>
      <PremiumTabs v-model="vm.selectedTab.value" :ariaLabel="'Rubriques du Centre Sécurité'" :tabs="tabs" />

      <section v-if="vm.selectedTab.value === 'overview'" class="security-panel">
        <header class="security-section-heading"><div><span>Situation actuelle</span><h2>Vue d’ensemble</h2><p>Les indicateurs ci-dessous proviennent des données réellement enregistrées.</p></div></header>
        <div class="security-stats">
          <StatCard label="Comptes Plateforme actifs" :value="vm.state.overview.comptesPlateformeActifs" hint="responsables actifs" :icon="UsersRound" tone="primary" />
          <StatCard label="Sessions actives" :value="vm.state.overview.sessionsActives" hint="connexions ouvertes" :icon="MonitorSmartphone" tone="success" />
          <StatCard label="Comptes suspendus" :value="vm.state.overview.comptesSuspendus" hint="accès temporairement arrêtés" :icon="UserRoundX" tone="warning" />
          <StatCard label="Comptes verrouillés" :value="vm.state.overview.comptesVerrouilles" hint="actions à examiner" :icon="LockKeyhole" tone="warning" />
          <StatCard label="Organisations sans administrateur" :value="vm.state.overview.organisationsSansAdministrateur" hint="gouvernance à compléter" :icon="Building2" tone="neutral" />
          <StatCard label="Écoles sans administrateur" :value="vm.state.overview.ecolesSansAdministrateur" hint="continuité à sécuriser" :icon="School" tone="neutral" />
        </div>
        <div class="security-attention" :class="{ 'security-attention--clear': totalAttention === 0 }"><component :is="totalAttention ? ShieldAlert : BadgeCheck" :size="24" /><div><strong>{{ totalAttention ? `${totalAttention} situation(s) à examiner` : 'Aucune alerte prioritaire' }}</strong><p>{{ totalAttention ? 'Ouvrez les comptes, administrateurs ou tentatives pour traiter chaque situation.' : 'La gouvernance visible ne présente aucune anomalie prioritaire.' }}</p></div></div>
      </section>

      <section v-else-if="vm.selectedTab.value === 'accounts'" class="security-panel">
        <SecurityPanelHeader eyebrow="Identités" title="Comptes Plateforme" description="Créez et administrez les identités qui interviennent au niveau global.">
          <button v-if="vm.canWriteAccounts.value" class="security-button" type="button" @click="vm.openCreateAccount"><UserRoundPlus :size="17" /> Nouveau compte</button>
        </SecurityPanelHeader>
        <SecurityToolbar v-model:search="vm.search.value" v-model:status="vm.statusFilter.value" placeholder="Nom, adresse e-mail ou rôle" :statuses="accountStatuses" />
        <SecurityAccountsTable :accounts="vm.accounts.value" :can-lifecycle="vm.canManageLifecycle.value" :can-unlock="vm.canUnlock.value" @action="vm.openAccountAction" />
        <div v-if="vm.canLoadMoreAccounts.value" class="security-load-more"><button class="security-button security-button--secondary" type="button" @click="vm.loadMoreAccounts">Afficher plus de comptes</button></div>
      </section>

      <section v-else-if="vm.selectedTab.value === 'administrators'" class="security-panel">
        <SecurityPanelHeader eyebrow="Continuité de service" title="Administrateurs des périmètres" description="Vérifiez qui gouverne chaque organisation et chaque école, sans confondre les responsabilités." />
        <div class="security-split">
          <article><header><Building2 :size="21" /><div><h3>Administrateurs Organisation</h3><p>{{ vm.state.organizationAdministrators.length }} affectation(s) visible(s)</p></div><button v-if="vm.canWriteOrganizationAdministrators.value" class="security-button" type="button" @click="vm.openAdministratorDialog('ORGANISATION')"><UserRoundPlus :size="16" /> Ajouter</button></header><SecurityGovernanceTable :rows="vm.state.organizationAdministrators" mode="organizations" :can-replace="vm.canWriteOrganizationAdministrators.value" @replace="vm.openAdministratorDialog('ORGANISATION',$event)" /></article>
          <article><header><School :size="21" /><div><h3>Administrateurs École</h3><p>{{ vm.state.schoolAdministrators.length }} affectation(s) visible(s)</p></div><button v-if="vm.canEmergencySchoolAdministrators.value" class="security-button security-button--secondary" type="button" @click="vm.openAdministratorDialog('ECOLE')"><ShieldAlert :size="16" /> Intervention exceptionnelle</button></header><SecurityGovernanceTable :rows="vm.state.schoolAdministrators" mode="schools" :can-replace="vm.canEmergencySchoolAdministrators.value" @replace="vm.openAdministratorDialog('ECOLE',$event)" /></article>
        </div>
      </section>

      <section v-else-if="vm.selectedTab.value === 'roles'" class="security-panel">
        <SecurityPanelHeader eyebrow="Capacités" title="Rôles et permissions" description="Consultez les responsabilités officielles et leur niveau d’application." />
        <SecurityRolesPanel :roles="vm.state.roles" :selected="vm.selectedRole.value" :catalog="vm.state.permissionCatalog" :can-write="vm.canWriteRoles.value" :busy="vm.busy.value" @create="vm.openCreateRole" @select="vm.selectRole" @state="vm.openRoleState" @permission="vm.openRolePermission" @restriction="vm.openRoleRestriction" />
      </section>

      <section v-else-if="vm.selectedTab.value === 'assignments'" class="security-panel">
        <SecurityPanelHeader eyebrow="Rôle + périmètre" title="Affectations et périmètres" description="Un rôle indique ce qu’une personne peut faire ; le périmètre indique où elle peut agir.">
          <button v-if="vm.canWriteAssignments.value" class="security-button" type="button" @click="vm.openCreateAssignment"><UserRoundPlus :size="17" /> Nouvelle affectation</button>
        </SecurityPanelHeader>
        <div v-if="vm.state.assignments.length" class="security-table-wrap"><table class="security-table"><thead><tr><th>Utilisateur</th><th>Rôle</th><th>Niveau</th><th>Périmètre</th><th>État</th><th v-if="vm.canWriteAssignments.value">Action</th></tr></thead><tbody><tr v-for="item in vm.state.assignments" :key="item.idAffectation"><td data-label="Utilisateur"><strong>{{ item.nomComplet }}</strong><small>{{ item.email }}</small></td><td data-label="Rôle">{{ item.roleLibelle }}</td><td data-label="Niveau"><span class="security-badge">{{ levelLabel(item.niveau) }}</span></td><td data-label="Périmètre"><div class="security-badges"><span v-for="scope in item.scopes" :key="`${scope.type}-${scope.valeur}`" class="security-badge">{{ levelLabel(scope.type) }}{{ scope.lectureSeule ? ' · lecture' : '' }}</span></div></td><td data-label="État"><span class="security-status" :class="item.etat === 'ACTIVE' ? 'security-status--active' : 'security-status--disabled'">{{ item.etat === 'ACTIVE' ? 'Active' : 'Inactive' }}</span></td><td v-if="vm.canWriteAssignments.value" data-label="Action"><button class="security-table-action" :class="{ 'security-table-action--danger':item.etat === 'ACTIVE' }" type="button" @click="vm.openAssignmentAction(item)">{{ item.etat === 'ACTIVE' ? 'Retirer' : 'Réactiver' }}</button></td></tr></tbody></table></div>
        <EmptyState v-else title="Aucune affectation visible" message="Les rôles attribués à des comptes apparaîtront ici avec leur périmètre." />
      </section>

      <section v-else-if="vm.selectedTab.value === 'sessions'" class="security-panel">
        <SecurityPanelHeader eyebrow="Appareils et connexions" title="Sessions" description="Surveillez les connexions ouvertes et fermez uniquement celles qui présentent un risque." />
        <SecurityToolbar v-model:search="vm.search.value" placeholder="Utilisateur, appareil ou adresse réseau" />
        <SecuritySessionsTable :sessions="vm.sessions.value" :can-revoke="vm.canRevokeSessions.value" @revoke="vm.openSessionAction" />
      </section>

      <section v-else-if="vm.selectedTab.value === 'attempts'" class="security-panel">
        <SecurityPanelHeader eyebrow="Prévention" title="Tentatives et verrouillages" description="Examinez les connexions récentes sans exposer d’informations sensibles." />
        <SecurityToolbar v-model:search="vm.search.value" v-model:status="vm.statusFilter.value" placeholder="Nom, adresse e-mail ou adresse réseau" :statuses="attemptStatuses" />
        <div v-if="vm.attempts.value.length" class="security-table-wrap"><table class="security-table"><thead><tr><th>Date</th><th>Compte</th><th>Résultat</th><th>Adresse réseau</th><th>Tentatives</th><th>Verrouillage</th></tr></thead><tbody><tr v-for="item in vm.attempts.value" :key="item.id"><td data-label="Date">{{ formatDate(item.date) }}</td><td data-label="Compte"><strong>{{ item.nomComplet || 'Identité non confirmée' }}</strong><small>{{ item.email }}</small></td><td data-label="Résultat"><span class="security-status" :class="item.reussie ? 'security-status--active' : 'security-status--suspended'">{{ item.resultat }}</span></td><td data-label="Adresse réseau">{{ item.adresseIp || 'Non disponible' }}</td><td data-label="Tentatives">{{ item.nombreTentatives }}</td><td data-label="Verrouillage">{{ item.verrouilleJusqua ? `Jusqu’au ${formatDate(item.verrouilleJusqua)}` : 'Aucun' }}</td></tr></tbody></table></div>
        <EmptyState v-else title="Aucune tentative ne correspond" message="Modifiez les filtres pour élargir la période visible." />
      </section>

      <section v-else-if="vm.selectedTab.value === 'audit'" class="security-panel">
        <SecurityPanelHeader eyebrow="Traçabilité" title="Historique de sécurité" description="Retrouvez les décisions importantes dans un journal durable et partagé avec le Centre Audit." />
        <SecurityToolbar v-model:search="vm.search.value" v-model:status="vm.statusFilter.value" placeholder="Action, acteur, cible ou motif" :statuses="auditStatuses" />
        <div v-if="vm.auditEntries.value.length" class="security-audit-list"><article v-for="(entry,index) in vm.auditEntries.value" :key="auditKey(entry,index)"><div class="security-audit-list__icon"><History :size="18" /></div><div><strong>{{ auditValue(entry,'action') || 'Action de sécurité' }}</strong><p>{{ auditValue(entry,'motif') || 'Décision enregistrée dans l’historique de sécurité.' }}</p><div class="security-badges"><span class="security-status" :class="entry.succes === true ? 'security-status--active' : 'security-status--suspended'">{{ entry.succes === true ? 'Réussie' : 'Refusée' }}</span><span v-if="auditValue(entry,'niveau_scope')" class="security-badge">{{ levelLabel(auditValue(entry,'niveau_scope')) }}</span></div><small>{{ formatDate(auditValue(entry,'cree_le') || auditValue(entry,'date_occurrence') || auditValue(entry,'occurredAt')) }}</small></div></article></div>
        <EmptyState v-else title="Aucun événement visible" message="Les décisions de sécurité auditées apparaîtront ici." />
        <div v-if="vm.canLoadMoreAudit.value" class="security-load-more"><button class="security-button security-button--secondary" type="button" @click="vm.auditVisibleLimit.value += 30">Afficher plus d’événements</button></div>
      </section>
    </template>

    <ModalShell :open="vm.dialog.value !== null" :aria-label="vm.dialogTitle.value" @close="vm.closeDialog">
      <template #header><div class="security-modal-heading"><div><span>Centre Sécurité</span><h2>{{ vm.dialogTitle.value }}</h2></div><button type="button" aria-label="Fermer" :disabled="vm.busy.value" @click="vm.closeDialog"><X :size="19" /></button></div></template>
      <form id="security-dialog-form" class="security-form" @submit.prevent="vm.submitDialog">
        <template v-if="vm.dialog.value === 'create-account'">
          <p class="security-form__intro">Créez une identité Plateforme et son affectation dans une seule opération contrôlée.</p>
          <label>Nom complet<input v-model.trim="vm.createForm.nomComplet" required autocomplete="name" /></label>
          <label>Adresse e-mail<input v-model.trim="vm.createForm.email" required type="email" autocomplete="email" /></label>
          <label>Téléphone <span>facultatif</span><input v-model.trim="vm.createForm.telephone" autocomplete="tel" /></label>
          <label>Rôle Plateforme<select v-model="vm.createForm.codeRole" required><option value="MANAGER_SYSTEME">Manager système</option><option value="OPERATEUR_SYSTEME">Opérateur système</option><option value="SUPPORT_SYSTEME">Support système</option></select></label>
          <label>Mot de passe initial<input v-model="vm.createForm.motDePasseInitial" required type="password" minlength="12" autocomplete="new-password" /><small>Au moins 12 caractères, selon la politique de sécurité.</small></label>
          <label>Motif <span>facultatif</span><textarea v-model.trim="vm.createForm.motif" rows="3" placeholder="Contexte de cette création" /></label>
        </template>
        <template v-else-if="vm.dialog.value === 'create-role'">
          <p class="security-form__intro">Créez une responsabilité adaptée à votre gouvernance sans modifier les rôles officiels EduSync.</p>
          <label>Nom du rôle<input v-model.trim="vm.roleForm.nomRole" required placeholder="Ex. Responsable conformité" /></label>
          <label>Code de référence<input v-model.trim="vm.roleForm.codeRole" required placeholder="RESPONSABLE_CONFORMITE" /><small>Majuscules, chiffres et tirets bas uniquement.</small></label>
          <label>Niveau d’application<select v-model="vm.roleForm.niveauAcces" required><option value="PLATEFORME">Plateforme</option><option value="ORGANISATION">Organisation</option><option value="ECOLE">École</option></select></label>
          <label>Description<textarea v-model.trim="vm.roleForm.description" rows="3" placeholder="Mission confiée à cette responsabilité" /></label>
          <div class="security-form__wide security-permission-picker"><label>Rechercher une autorisation<input v-model.trim="rolePermissionSearch" type="search" placeholder="Comptes, sessions, audit…" /></label><fieldset><legend>Autorisations initiales</legend><label v-for="permission in filteredPermissionCatalog" :key="permission.code"><input v-model="vm.roleForm.permissions" type="checkbox" :value="permission.code" /><span><strong>{{ permissionLabel(permission.code) }}</strong><small>{{ permissionDomain(permission.code) }}</small></span></label></fieldset><small>{{ vm.roleForm.permissions.length }} autorisation(s) sélectionnée(s)</small></div>
          <label class="security-form__wide">Motif de création<textarea v-model.trim="vm.roleForm.motif" required rows="3" placeholder="Expliquez le besoin couvert par ce rôle" /></label>
        </template>
        <template v-else-if="vm.dialog.value === 'role-action'">
          <div class="security-impact"><TriangleAlert :size="22" /><div><strong>Impact avant confirmation</strong><p>Cette décision modifie les capacités effectives des personnes auxquelles ce rôle est affecté. Elle sera intégralement tracée.</p></div></div>
          <label class="security-form__wide">Motif de la décision<textarea v-model.trim="vm.reason.value" required rows="4" placeholder="Expliquez brièvement cette décision" /></label>
        </template>
        <template v-else-if="vm.dialog.value === 'create-assignment'">
          <p class="security-form__intro">Attribuez une responsabilité dans un périmètre précis. EduSync contrôle la cohérence avant l’enregistrement.</p>
          <label>Compte<select v-model="vm.assignmentForm.idUtilisateur" required><option value="" disabled>Sélectionnez une personne</option><option v-for="account in vm.state.accounts" :key="account.id" :value="account.id">{{ account.nomComplet }} · {{ account.email }}</option></select></label>
          <label>Rôle<select :value="vm.assignmentForm.codeRole" required @change="vm.selectAssignmentRole(($event.target as HTMLSelectElement).value)"><option value="" disabled>Sélectionnez une responsabilité</option><option v-for="role in vm.state.roles.filter(item=>item.estActif)" :key="role.codeRole" :value="role.codeRole">{{ role.nomRole }} · {{ levelLabel(role.niveauAcces) }}</option></select></label>
          <label>Niveau d’application<input :value="levelLabel(vm.assignmentForm.niveau ?? 'PLATEFORME')" readonly /></label>
          <label v-if="vm.assignmentForm.niveau !== 'PLATEFORME'">Organisation<select v-model="vm.assignmentForm.organisationId" required @change="vm.assignmentForm.ecoleId=undefined"><option :value="undefined" disabled>Sélectionnez une organisation</option><option v-for="scope in vm.organizationOptions.value" :key="scope.organisationId" :value="scope.organisationId">{{ scope.organisationNom }}</option></select></label>
          <label v-if="vm.assignmentForm.niveau === 'ECOLE'">École<select v-model="vm.assignmentForm.ecoleId" required><option :value="undefined" disabled>Sélectionnez une école</option><option v-for="scope in vm.assignmentSchoolOptions.value" :key="scope.ecoleId" :value="scope.ecoleId">{{ scope.ecoleNom }}</option></select></label>
          <label class="security-form__wide">Motif de l’affectation<textarea v-model.trim="vm.assignmentForm.motif" required rows="4" placeholder="Expliquez la responsabilité confiée" /></label>
        </template>
        <template v-else-if="vm.dialog.value === 'assignment-action'">
          <div class="security-impact"><TriangleAlert :size="22" /><div><strong>Impact avant confirmation</strong><p>{{ vm.assignmentWillBeActive.value ? 'Le compte retrouvera les capacités de ce rôle dans ce périmètre, sans recréer de session.' : 'Le compte perdra les capacités de ce rôle dans ce périmètre. Le dernier administrateur actif reste protégé.' }}</p></div></div>
          <label class="security-form__wide">Motif de la décision<textarea v-model.trim="vm.reason.value" required rows="4" placeholder="Expliquez brièvement cette décision" /></label>
        </template>
        <template v-else-if="vm.dialog.value === 'administrator'">
          <div v-if="vm.administratorLevel.value === 'ECOLE'" class="security-impact"><ShieldAlert :size="22" /><div><strong>Intervention Plateforme exceptionnelle</strong><p>Le parcours normal appartient à l’administrateur Organisation. Cette intervention sera intégralement tracée.</p></div></div>
          <label>Organisation<select v-model="vm.selectedOrganizationId.value" required :disabled="Boolean(vm.selectedAdministrator.value)"><option value="" disabled>Sélectionnez une organisation</option><option v-for="scope in vm.organizationOptions.value" :key="scope.organisationId" :value="scope.organisationId">{{ scope.organisationNom }}</option></select></label>
          <label v-if="vm.administratorLevel.value === 'ECOLE'">École<select v-model="vm.selectedSchoolId.value" required :disabled="Boolean(vm.selectedAdministrator.value)"><option value="" disabled>Sélectionnez une école</option><option v-for="scope in vm.schoolOptions.value" :key="scope.ecoleId" :value="scope.ecoleId">{{ scope.ecoleNom }}</option></select></label>
          <fieldset class="security-choice"><legend>Compte à affecter</legend><label><input v-model="vm.administratorMode.value" type="radio" value="NEW" /> Nouveau compte</label><label><input v-model="vm.administratorMode.value" type="radio" value="EXISTING" /> Compte existant</label></fieldset>
          <label v-if="vm.administratorMode.value === 'EXISTING'">Compte existant<select v-model="vm.administratorForm.idUtilisateur" required><option value="" disabled>Sélectionnez une personne</option><option v-for="account in vm.state.accounts" :key="account.id" :value="account.id">{{ account.nomComplet }} · {{ account.email }}</option></select></label>
          <template v-else><label>Nom complet<input v-model.trim="vm.administratorForm.nomComplet" required autocomplete="name" /></label><label>Adresse e-mail<input v-model.trim="vm.administratorForm.email" required type="email" autocomplete="email" /></label><label>Téléphone <span>facultatif</span><input v-model.trim="vm.administratorForm.telephone" autocomplete="tel" /></label><label>Mot de passe initial<input v-model="vm.administratorForm.motDePasseInitial" required type="password" minlength="12" autocomplete="new-password" /></label></template>
          <label class="security-form__wide">Motif de la décision<textarea v-model.trim="vm.administratorForm.motif" required rows="4" placeholder="Expliquez le contexte de cette affectation" /></label>
        </template>
        <template v-else>
          <div class="security-impact"><TriangleAlert :size="22" /><div><strong>Impact avant confirmation</strong><p>{{ actionImpact }}</p></div></div>
          <label v-if="vm.action.value === 'reset-password'">Nouveau mot de passe<input v-model="vm.newPassword.value" required type="password" minlength="12" autocomplete="new-password" /><small>Au moins 12 caractères. Toutes les connexions existantes seront fermées.</small></label>
          <label v-if="vm.requiresReason.value">Motif de la décision<textarea v-model.trim="vm.reason.value" required rows="4" placeholder="Expliquez brièvement cette décision" /></label>
        </template>
      </form>
      <template #footer><div class="security-modal-actions"><button class="security-button security-button--secondary" type="button" :disabled="vm.busy.value" @click="vm.closeDialog">Annuler</button><button class="security-button" :class="{ 'security-button--danger': ['suspend','deactivate','revoke','revoke-all'].includes(vm.action.value) }" type="submit" form="security-dialog-form" :disabled="!vm.canSubmit.value || vm.busy.value">{{ vm.busy.value ? 'Enregistrement…' : 'Confirmer' }}</button></div></template>
    </ModalShell>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { BadgeCheck, Building2, History, KeyRound, LayoutDashboard, ListChecks, LockKeyhole, MonitorSmartphone, RefreshCw, School, Shield, ShieldAlert, ShieldCheck, ShieldQuestion, TriangleAlert, UserRoundPlus, UserRoundSearch, UserRoundX, UsersRound, X } from 'lucide-vue-next';
import ModalShell from '../../../components/communs/ModalShell.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import PremiumTabs from '../../../shared/ui/PremiumTabs.vue';
import StatCard from '../../../shared/ui/StatCard.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SecurityAccountsTable from '../components/SecurityAccountsTable.vue';
import SecurityGovernanceTable from '../components/SecurityGovernanceTable.vue';
import SecurityPanelHeader from '../components/SecurityPanelHeader.vue';
import SecurityRolesPanel from '../components/SecurityRolesPanel.vue';
import SecuritySessionsTable from '../components/SecuritySessionsTable.vue';
import SecurityToolbar from '../components/SecurityToolbar.vue';
import { useSecurityCenterViewModel } from '../view-models/useSecurityCenterViewModel';
import '../components/security-center.css';

const vm = useSecurityCenterViewModel();
const rolePermissionSearch=ref('');
const tabs = [
  { code:'overview',label:'Vue d’ensemble',icon:LayoutDashboard }, { code:'accounts',label:'Comptes',icon:UsersRound },
  { code:'administrators',label:'Administrateurs',icon:ShieldCheck }, { code:'roles',label:'Rôles',icon:Shield },
  { code:'assignments',label:'Affectations',icon:ListChecks }, { code:'sessions',label:'Sessions',icon:MonitorSmartphone },
  { code:'attempts',label:'Tentatives',icon:LockKeyhole }, { code:'audit',label:'Historique',icon:History },
];
const accountStatuses = [{value:'ALL',label:'Tous les états'},{value:'ACTIVE',label:'Actifs'},{value:'SUSPENDED',label:'Suspendus'},{value:'DISABLED',label:'Désactivés'}];
const attemptStatuses = [{value:'ALL',label:'Tous les résultats'},{value:'SUCCESS',label:'Réussies'},{value:'FAILED',label:'Refusées'}];
const auditStatuses = [{value:'ALL',label:'Tous les résultats'},{value:'SUCCESS',label:'Actions réussies'},{value:'FAILED',label:'Actions refusées'}];
const totalAttention = computed(() => vm.state.overview.organisationsSansAdministrateur + vm.state.overview.ecolesSansAdministrateur + vm.state.overview.comptesVerrouilles);
const filteredPermissionCatalog=computed(()=>{const term=rolePermissionSearch.value.toLocaleLowerCase('fr');return vm.state.permissionCatalog.filter(item=>!term || `${item.code} ${permissionLabel(item.code)} ${permissionDomain(item.code)}`.toLocaleLowerCase('fr').includes(term));});
const permissionLabel=(value:string)=>value.split('.').slice(1).join(' ').replace(/[_-]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase()) || 'Autorisation métier';
const permissionDomain=(value:string)=>({security:'Sécurité',roles:'Rôles',permissions:'Autorisations',utilisateurs:'Utilisateurs',configuration:'Configuration',referentiel:'Référentiel',audit:'Historique'}[value.split('.')[0]] ?? 'Fonction métier');
const actionImpact = computed(() => ({
  suspend:'Le compte deviendra temporairement inutilisable et toutes ses connexions seront fermées.',
  reactivate:'Le compte pourra se connecter de nouveau. Aucune ancienne connexion ne sera restaurée.',
  deactivate:'Le compte deviendra durablement inutilisable et toutes ses connexions seront fermées.',
  unlock:'Le verrouillage sera levé et le compteur de tentatives sera réinitialisé.',
  'reset-password':'Le mot de passe sera remplacé, toutes les connexions seront fermées et une nouvelle authentification sera nécessaire.',
  revoke:'Cette connexion sera immédiatement fermée. Les autres appareils resteront connectés.',
  'revoke-all':'Toutes les connexions de ce compte seront immédiatement fermées.',
}[vm.action.value]));
const levelLabel = (value: string) => ({PLATEFORME:'Plateforme',ORGANISATION:'Organisation',ECOLE:'École'}[value] ?? value);
const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('fr-CD',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : 'Date non disponible';
const auditValue = (entry: Record<string,unknown>, key: string) => typeof entry[key] === 'string' ? entry[key] as string : '';
const auditKey = (entry: Record<string,unknown>, index: number) => auditValue(entry,'id') || auditValue(entry,'id_entree_audit') || `audit-${index}`;
</script>
