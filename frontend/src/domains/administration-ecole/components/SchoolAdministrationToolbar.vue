<template>
  <ActionToolbar
    title="Pilotage du registre"
    description="Affinez la lecture des ecoles, changez d'organisation et lancez les actions autorisees sans quitter le centre."
  >
    <template #filters>
      <label class="school-admin-toolbar__field school-admin-toolbar__field--search">
        <span>Recherche</span>
        <input
          :value="search"
          type="text"
          placeholder="Nom, code, sigle, ville ou commune..."
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="school-admin-toolbar__field">
        <span>Organisation</span>
        <select :value="organizationId" @change="$emit('update:organizationId', ($event.target as HTMLSelectElement).value)">
          <option value="">Selectionner une organisation</option>
          <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
            {{ organization.code }} - {{ organization.nom }}
          </option>
        </select>
      </label>

      <label class="school-admin-toolbar__field">
        <span>Statut</span>
        <select :value="statusFilter" @change="onStatusFilterChange($event)">
          <option value="ALL">Tous</option>
          <option value="ACTIVE">Actives</option>
          <option value="INACTIVE">Inactives</option>
        </select>
      </label>

      <label class="school-admin-toolbar__field">
        <span>Mode</span>
        <select :value="modeFilter" @change="onModeFilterChange($event)">
          <option value="ALL">Tous les modes</option>
          <option v-for="option in schoolModeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
    </template>

    <template #actions>
      <button class="school-admin-toolbar__button" type="button" :disabled="busy" @click="$emit('clearFilters')">
        Effacer les filtres
      </button>
      <button class="school-admin-toolbar__button" type="button" :disabled="busy || !organizationId" @click="$emit('refresh')">
        Actualiser
      </button>
      <button
        v-if="canCreate"
        class="school-admin-toolbar__button school-admin-toolbar__button--primary"
        type="button"
        :disabled="busy || organizations.length === 0"
        @click="$emit('create')"
      >
        Nouvelle ecole
      </button>
    </template>
  </ActionToolbar>
</template>

<script setup lang="ts">
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import type { SchoolAdministrationOrganizationItem, SchoolModeValue } from '../models/school-administration.model';
import { schoolModeOptions } from '../models/school-administration.model';

defineProps<{
  search: string;
  organizationId: string;
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE';
  modeFilter: 'ALL' | SchoolModeValue;
  organizations: readonly SchoolAdministrationOrganizationItem[];
  canCreate: boolean;
  busy: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:search', value: string): void;
  (event: 'update:organizationId', value: string): void;
  (event: 'update:statusFilter', value: 'ALL' | 'ACTIVE' | 'INACTIVE'): void;
  (event: 'update:modeFilter', value: 'ALL' | SchoolModeValue): void;
  (event: 'clearFilters'): void;
  (event: 'refresh'): void;
  (event: 'create'): void;
}>();

function onStatusFilterChange(event: Event): void {
  emit('update:statusFilter', (event.target as HTMLSelectElement).value as 'ALL' | 'ACTIVE' | 'INACTIVE');
}

function onModeFilterChange(event: Event): void {
  emit('update:modeFilter', (event.target as HTMLSelectElement).value as 'ALL' | SchoolModeValue);
}
</script>

<style scoped>
.school-admin-toolbar__field{display:grid;gap:.45rem;min-width:180px;flex:1 1 180px}
.school-admin-toolbar__field--search{flex:2 1 260px}
.school-admin-toolbar__field span{color:#4d6477;font-weight:700;font-size:.92rem}
.school-admin-toolbar__field input,.school-admin-toolbar__field select{width:100%;min-height:52px;border-radius:18px;border:1px solid rgba(17,40,63,.14);background:#fbfdff;padding:.85rem .95rem;color:#10243b}
.school-admin-toolbar__button{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.82rem 1.15rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f}
.school-admin-toolbar__button--primary{background:linear-gradient(135deg,#113f67,#1a6aa0);border-color:transparent;color:#fff;box-shadow:0 18px 32px rgba(17,63,103,.2)}
.school-admin-toolbar__button:disabled{opacity:.55;cursor:not-allowed;box-shadow:none}
</style>
