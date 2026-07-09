<template>
  <div class="org-toolbar-stack">
    <ActionToolbar
      title="Actions et filtres"
      description="Affinez le registre, actualisez les donnees et lancez les exports sans quitter cette vue."
    >
      <template #filters>
        <label class="org-search-field">
          <Search :size="18" />
          <input :value="searchTerm" type="search" placeholder="Rechercher une organisation..." @input="$emit('update:searchTerm', ($event.target as HTMLInputElement).value)" />
        </label>

        <label class="org-select-field">
          <span>Type</span>
          <select :value="typeFilter" @change="$emit('update:typeFilter', ($event.target as HTMLSelectElement).value)">
            <option value="">Tous les types</option>
            <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </label>

        <label class="org-select-field">
          <span>Statut</span>
          <select :value="statusFilter" @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)">
            <option value="">Tous les statuts</option>
            <option value="ACTIVE">Actives</option>
            <option value="INACTIVE">Inactives</option>
          </select>
        </label>
      </template>

      <template #actions>
        <button class="org-action-button org-action-button--ghost" type="button" :disabled="busy" @click="$emit('refresh')">
          <RefreshCcw :size="16" />
          <span>Actualiser</span>
        </button>
        <button class="org-action-button org-action-button--excel" type="button" :disabled="disableExports" @click="$emit('exportExcel')">
          <FileSpreadsheet :size="16" />
          <span>Exporter Excel</span>
        </button>
        <button class="org-action-button org-action-button--pdf" type="button" :disabled="disableExports" @click="$emit('exportPdf')">
          <FileText :size="16" />
          <span>Exporter PDF</span>
        </button>
      </template>
    </ActionToolbar>

    <div class="org-summary-grid">
      <StatCard label="Organisations" :value="visibleCount" :hint="`sur ${totalCount} visibles`" :icon="Building2" tone="primary" />
      <StatCard label="Actives" :value="activeCount" hint="registre filtre" :icon="BadgeCheck" tone="success" />
      <StatCard label="Inactives" :value="inactiveCount" hint="registre filtre" :icon="ShieldAlert" tone="warning" />
      <StatCard label="Ecoles visibles" :value="visibleSchoolsTotal" hint="dans le perimetre visible" :icon="School" tone="neutral" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { BadgeCheck, Building2, FileSpreadsheet, FileText, RefreshCcw, School, Search, ShieldAlert } from 'lucide-vue-next';
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import StatCard from '../../../shared/ui/StatCard.vue';

defineProps<{
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
  availableTypes: readonly string[];
  visibleCount: number;
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  visibleSchoolsTotal: number;
  disableExports: boolean;
  busy: boolean;
}>();

defineEmits<{
  (event: 'update:searchTerm', value: string): void;
  (event: 'update:typeFilter', value: string): void;
  (event: 'update:statusFilter', value: string): void;
  (event: 'refresh'): void;
  (event: 'exportExcel'): void;
  (event: 'exportPdf'): void;
}>();
</script>

<style scoped>
.org-toolbar-stack{display:grid;gap:1rem}
.org-search-field,.org-select-field{display:grid;gap:.45rem;min-width:0}
.org-select-field span{font-size:.85rem;font-weight:700;color:#4b6475}
.org-search-field{grid-template-columns:auto 1fr;align-items:center;padding:0 .95rem;border-radius:18px;border:1px solid rgba(17,40,63,.12);background:#fbfdff;min-height:56px;box-shadow:inset 0 1px 0 rgba(255,255,255,.92)}
.org-search-field input{border:0;background:transparent;outline:none;padding:.95rem .15rem}
.org-search-field:focus-within,
.org-select-field select:focus-visible{
  border-color:rgba(17,128,163,.32);
  box-shadow:0 0 0 4px rgba(17,128,163,.12);
}
.org-select-field select{border-radius:18px;border:1px solid rgba(17,40,63,.12);padding:.9rem 1rem;background:#fbfdff;font:inherit;color:#11283f;min-height:56px;box-shadow:inset 0 1px 0 rgba(255,255,255,.92)}
.org-action-button{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;min-height:48px;padding:.82rem 1.08rem;border-radius:18px;border:1px solid rgba(17,40,63,.1);font-weight:700;color:#12324d;background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(245,249,253,.98));box-shadow:0 10px 24px rgba(15,23,42,.06), inset 0 1px 0 rgba(255,255,255,.92);transition:transform .18s ease, box-shadow .18s ease, border-color .18s ease, opacity .18s ease}
.org-action-button:hover{transform:translateY(-1px);box-shadow:0 16px 34px rgba(15,23,42,.1)}
.org-action-button:disabled{opacity:.56;cursor:not-allowed;transform:none;box-shadow:none}
.org-action-button--ghost:hover{border-color:rgba(20,135,168,.24);color:#0d5f7a}
.org-action-button--excel{background:linear-gradient(180deg,#f3fbf6,#ebf8f0);border-color:rgba(24,121,78,.14);color:#166534}
.org-action-button--pdf{background:linear-gradient(180deg,#fff6f6,#fff1f1);border-color:rgba(185,28,28,.14);color:#b91c1c}
.org-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem}
@media (max-width: 720px){
  .org-action-button{width:100%}
}
</style>
