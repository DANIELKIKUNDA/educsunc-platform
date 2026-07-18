<template>
  <PageContainer>
    <PageHeader eyebrow="SCR-SEC-001" title="Gouvernance des roles et permissions" description="Administration plateforme des roles, permissions et restrictions security.">
      <template #actions>
        <RouterLink class="sec-pill" to="/app/security">
          <ArrowLeft />
          <span>Retour security</span>
        </RouterLink>
      </template>
    </PageHeader>

    <SectionBlock title="Commandes roles" description="La vue pilote uniquement les routes plateforme deja exposees pour les roles security.">
      <div class="sec-grid">
        <label class="sec-field">
          <span>Code role</span>
          <input v-model="roleCode" type="text" placeholder="PREFET_ETUDES" />
        </label>
        <label class="sec-field">
          <span>Nom role</span>
          <input v-model="roleName" type="text" placeholder="Prefet des etudes" />
        </label>
        <label class="sec-field">
          <span>Niveau acces</span>
          <input v-model="roleAccessLevel" type="text" placeholder="ECOLE" />
        </label>
        <label class="sec-field">
          <span>Permission</span>
          <input v-model="permission" type="text" placeholder="bulletins.read" />
        </label>
        <label class="sec-field">
          <span>Restriction</span>
          <input v-model="restriction" type="text" placeholder="SECTION_SECONDAIRE_ONLY" />
        </label>
      </div>

      <div class="sec-actions">
        <button class="sec-pill sec-pill--action" type="button" @click="loadRoles">Lister roles</button>
        <button class="sec-pill" type="button" @click="createRole">Creer role</button>
        <button class="sec-pill" type="button" :disabled="!roleCode" @click="activateRole">Activer</button>
        <button class="sec-pill" type="button" :disabled="!roleCode" @click="deactivateRole">Desactiver</button>
        <button class="sec-pill" type="button" :disabled="!roleCode" @click="loadPermissions">Permissions</button>
        <button class="sec-pill" type="button" :disabled="!roleCode || !permission" @click="addPermission">Ajouter permission</button>
        <button class="sec-pill" type="button" :disabled="!roleCode || !permission" @click="removePermission">Retirer permission</button>
        <button class="sec-pill" type="button" :disabled="!roleCode || !restriction" @click="addRestriction">Ajouter restriction</button>
        <button class="sec-pill" type="button" :disabled="!roleCode || !restriction" @click="removeRestriction">Retirer restriction</button>
      </div>
    </SectionBlock>

    <LoadingState v-if="store.state.status === 'loading'" title="Security en cours" message="Le backend recharge la gouvernance des roles." />
    <ErrorState v-else-if="store.state.status === 'error'" title="Action security impossible" :message="store.state.errorMessage ?? 'Le workflow roles security a echoue.'" />

    <template v-else>
      <SectionBlock title="Resume" description="Projection des roles et de leur detail de gouvernance.">
        <div class="sec-summary-grid">
          <div class="sec-card">
            <small>Roles</small>
            <strong>{{ store.resumeRoles(store.state.roles) }}</strong>
          </div>
          <div class="sec-card">
            <small>Permissions role</small>
            <strong>{{ store.state.rolePermissions?.permissions.length ?? 0 }} permission(s)</strong>
          </div>
          <div class="sec-card">
            <small>Restrictions role</small>
            <strong>{{ store.state.roleRestrictions?.restrictions.length ?? 0 }} restriction(s)</strong>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Liste des roles" description="Lecture plateforme stable des roles security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.roles) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.rolePermissions" title="Permissions du role" description="Projection relue depuis le backend.">
        <pre class="sec-preview">{{ store.formatJson(store.state.rolePermissions) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.roleRestrictions" title="Restrictions du role" description="Projection issue des mutations de restrictions.">
        <pre class="sec-preview">{{ store.formatJson(store.state.roleRestrictions) }}</pre>
      </SectionBlock>

      <SectionBlock v-if="store.state.lastMutation" title="Derniere mutation" description="Retour brut des operations role security.">
        <pre class="sec-preview">{{ store.formatJson(store.state.lastMutation) }}</pre>
      </SectionBlock>
    </template>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { ArrowLeft } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import LoadingState from '../../../shared/ui/LoadingState.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import { useSecurityStore } from '../stores/security.store';

const store = useSecurityStore();
const roleCode = ref('');
const roleName = ref('');
const roleAccessLevel = ref('ECOLE');
const permission = ref('');
const restriction = ref('');

async function loadRoles(): Promise<void> {
  await store.chargerRoles();
}

async function createRole(): Promise<void> {
  await store.creerRole({
    codeRole: roleCode.value.trim(),
    nomRole: roleName.value.trim(),
    niveauAcces: roleAccessLevel.value.trim(),
    permissions: permission.value.trim() ? [permission.value.trim()] : [],
  });
}

async function activateRole(): Promise<void> {
  await store.activerRole(roleCode.value.trim());
}

async function deactivateRole(): Promise<void> {
  await store.desactiverRole(roleCode.value.trim());
}

async function loadPermissions(): Promise<void> {
  await store.chargerPermissionsRole(roleCode.value.trim());
}

async function addPermission(): Promise<void> {
  await store.ajouterPermissionRole(roleCode.value.trim(), {
    permission: permission.value.trim(),
  });
}

async function removePermission(): Promise<void> {
  await store.retirerPermissionRole(roleCode.value.trim(), permission.value.trim());
}

async function addRestriction(): Promise<void> {
  await store.ajouterRestrictionRole(roleCode.value.trim(), {
    codeRestriction: restriction.value.trim(),
  });
}

async function removeRestriction(): Promise<void> {
  await store.retirerRestrictionRole(roleCode.value.trim(), restriction.value.trim());
}
</script>

<style scoped>
.sec-grid,.sec-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.sec-field{display:grid;gap:.45rem}
.sec-field input{border-radius:16px;border:1px solid rgba(17,40,63,.16);padding:.8rem .9rem;background:#fbfdff}
.sec-actions{display:flex;flex-wrap:wrap;gap:.75rem}
.sec-pill{border:1px solid rgba(17,40,63,.14);background:#fff;color:#11283f;border-radius:999px;padding:.75rem 1rem;display:inline-flex;align-items:center;gap:.5rem;font-weight:600;text-decoration:none}
.sec-pill--action{background:linear-gradient(135deg,#0b5d7a,#1487a8);color:#fff;border-color:transparent}
.sec-summary-grid .sec-card{border-radius:24px;padding:1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 45px rgba(17,40,63,.08);display:grid;gap:.35rem}
.sec-preview{margin:0;white-space:pre-wrap;word-break:break-word;padding:1rem;border-radius:20px;background:#102844;color:#edf5fb}
</style>
