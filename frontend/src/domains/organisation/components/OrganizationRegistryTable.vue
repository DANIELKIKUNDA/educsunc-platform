<template>
  <div class="org-table-card">
    <div class="org-table-shell">
      <table class="org-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Organisation</th>
            <th>Responsable</th>
            <th>Type</th>
            <th>Ecoles</th>
            <th>Statut</th>
            <th>Date de creation</th>
            <th>Derniere modification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="organisation in organisations"
            :key="organisation.id"
          >
            <td>
              <div class="org-code-cell">
                <strong>{{ organisation.code }}</strong>
                <small>Version {{ organisation.version }}</small>
              </div>
            </td>
            <td>
              <div class="org-identity-cell">
                <strong>{{ organisation.nom }}</strong>
                <small>{{ organisation.description || 'Aucune description renseignee.' }}</small>
              </div>
            </td>
            <td>
              <div class="org-promoter-cell">
                <strong>{{ lirePromoteur(organisation) }}</strong>
                <small>Responsable principal</small>
              </div>
            </td>
            <td>{{ organisation.typeOrganisation }}</td>
            <td>
              <div class="org-school-count">
                <strong>{{ schoolCountByOrganisation[organisation.id] ?? '...' }}</strong>
                <small>Ecoles</small>
              </div>
            </td>
            <td>
              <span :class="['org-status-badge', organisation.actif ? 'is-active' : 'is-inactive']">
                {{ organisation.actif ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formaterDate(organisation.creeLe) }}</td>
            <td>{{ formaterDate(organisation.modifieLe ?? organisation.creeLe, true) }}</td>
            <td>
              <div class="org-row-actions">
                <button class="org-icon-button" type="button" title="Voir" :disabled="busy" @click="$emit('open', organisation.id)">
                  <Eye :size="16" />
                </button>
                <button class="org-icon-button" type="button" title="Ouvrir les ecoles" :disabled="busy" @click="$emit('openSchools', organisation.id)">
                  <School :size="16" />
                </button>
                <button
                  v-if="canMutateOrganisation"
                  class="org-icon-button"
                  type="button"
                  title="Modifier"
                  :disabled="busy"
                  @click="$emit('edit', organisation)"
                >
                  <Pencil :size="16" />
                </button>
                <button
                  v-if="canMutateOrganisation"
                  class="org-icon-button"
                  type="button"
                  :title="organisation.actif ? 'Desactiver' : 'Activer'"
                  :disabled="busy"
                  @click="$emit('toggleStatus', organisation)"
                >
                  <Power :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <DataPagination
      :visible-items="paginationEnd"
      :total-items="totalItems"
      :rows-per-page="rowsPerPage"
      :can-load-more="currentPage < totalPages"
      :can-reset="currentPage > 1 || rowsPerPage !== 10"
      :auto-load="false"
      @update:rows-per-page="$emit('update:rowsPerPage', $event)"
      @load-more="$emit('update:currentPage', currentPage + 1)"
      @show-all="$emit('update:rowsPerPage', totalItems)"
      @reset="resetPagination"
    />
  </div>
</template>

<script setup lang="ts">
import { Eye, Pencil, Power, School } from 'lucide-vue-next';
import DataPagination from '../../../shared/ui/DataPagination.vue';
import type { OrganisationItem } from '../models/organization-governance.model';

defineProps<{
  organisations: readonly OrganisationItem[];
  schoolCountByOrganisation: Record<string, number>;
  canMutateOrganisation: boolean;
  paginationStart: number;
  paginationEnd: number;
  totalItems: number;
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  lirePromoteur: (organisation: OrganisationItem) => string;
  formaterDate: (value: string | undefined, withTime?: boolean) => string;
  busy: boolean;
}>();

const emit = defineEmits<{
  (event: 'open', idOrganisation: string): void;
  (event: 'openSchools', idOrganisation: string): void;
  (event: 'edit', organisation: OrganisationItem): void;
  (event: 'toggleStatus', organisation: OrganisationItem): void;
  (event: 'update:rowsPerPage', value: number): void;
  (event: 'update:currentPage', value: number): void;
}>();

function resetPagination(): void {
  emit('update:rowsPerPage', 10);
  emit('update:currentPage', 1);
}
</script>

<style scoped>
.org-table-card{margin-top:1rem;overflow:hidden;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.org-table-shell{overflow:auto}
.org-table{width:100%;border-collapse:separate;border-spacing:0}
.org-table th,.org-table td{padding:1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.org-table th{position:sticky;top:0;z-index:1;font-size:.84rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;background:#f8fbff;font-weight:800;backdrop-filter:blur(10px)}
.org-table tbody tr{transition:background-color .18s ease,transform .18s ease}
.org-table tbody tr:hover{background:#fbfdff}
.org-code-cell,.org-identity-cell,.org-promoter-cell,.org-school-count{display:grid;gap:.22rem}
.org-code-cell small,.org-identity-cell small,.org-promoter-cell small,.org-school-count small{color:#587083}
.org-status-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.38rem .78rem;font-weight:700;font-size:.82rem}
.org-status-badge.is-active{background:#eaf8ef;color:#166534}
.org-status-badge.is-inactive{background:#fff1f1;color:#b91c1c}
.org-row-actions{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
.org-icon-button{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:14px;border:1px solid rgba(17,40,63,.12);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(247,250,255,.96));color:#17324a;box-shadow:0 8px 18px rgba(15,23,42,.05)}
.org-icon-button:hover{background:#f6f9fc;border-color:rgba(20,135,168,.2);color:#0d5f7a}
.org-icon-button:disabled{opacity:.55;cursor:not-allowed}
@media (max-width: 720px){
  .org-table th,.org-table td{padding:.82rem}
}
</style>
