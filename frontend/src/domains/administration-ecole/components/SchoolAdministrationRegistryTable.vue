<template>
  <div class="school-admin-registry">
    <div class="school-admin-registry__table-shell">
      <table class="school-admin-registry__table">
        <thead>
          <tr>
            <th>Ecole</th>
            <th>Organisation</th>
            <th>Code</th>
            <th>Localisation</th>
            <th>Mode d'exploitation</th>
            <th>Statut</th>
            <th>Derniere modification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="school in schools" :key="school.id">
            <td>
              <div class="school-admin-registry__identity">
                <strong>{{ school.nom }}</strong>
                <small>{{ school.sigle || "Sans sigle" }}</small>
              </div>
            </td>
            <td>{{ organizationName }}</td>
            <td>
              <div class="school-admin-registry__identity">
                <strong>{{ school.code }}</strong>
                <small>Version {{ school.version }}</small>
              </div>
            </td>
            <td>
              <div class="school-admin-registry__identity">
                <strong>{{ school.ville || "Ville non renseignee" }}</strong>
                <small>{{ school.communeOuTerritoire || school.provinceEducationnelle || "Localisation a completer" }}</small>
              </div>
            </td>
            <td><SchoolModeBadge :mode="school.modeExploitation" /></td>
            <td><SchoolStatusBadge :active="school.actif" /></td>
            <td>{{ formatDate(school.modifieLe || school.creeLe) }}</td>
            <td>
              <div class="school-admin-registry__actions">
                <button class="school-admin-registry__action" type="button" :disabled="busy" @click="$emit('open', school.id)">
                  Ouvrir la fiche
                </button>
                <button
                  v-if="canMutate"
                  class="school-admin-registry__action"
                  type="button"
                  :disabled="busy"
                  @click="$emit('toggleStatus', school)"
                >
                  {{ school.actif ? "Desactiver" : "Activer" }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="school-admin-registry__mobile-list">
      <article v-for="school in schools" :key="`${school.id}-mobile`" class="school-admin-registry__mobile-card">
        <header>
          <div>
            <h3>{{ school.nom }}</h3>
            <p>{{ school.code }}<span v-if="school.sigle"> · {{ school.sigle }}</span></p>
          </div>
          <SchoolStatusBadge :active="school.actif" />
        </header>
        <div class="school-admin-registry__mobile-meta">
          <div><span>Organisation</span><strong>{{ organizationName }}</strong></div>
          <div><span>Ville</span><strong>{{ school.ville || "Non renseignee" }}</strong></div>
          <div><span>Mode</span><strong><SchoolModeBadge :mode="school.modeExploitation" /></strong></div>
          <div><span>Derniere modification</span><strong>{{ formatDate(school.modifieLe || school.creeLe) }}</strong></div>
        </div>
        <div class="school-admin-registry__actions">
          <button class="school-admin-registry__action" type="button" :disabled="busy" @click="$emit('open', school.id)">
            Ouvrir la fiche
          </button>
          <button
            v-if="canMutate"
            class="school-admin-registry__action"
            type="button"
            :disabled="busy"
            @click="$emit('toggleStatus', school)"
          >
            {{ school.actif ? "Desactiver" : "Activer" }}
          </button>
        </div>
      </article>
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
import DataPagination from '../../../shared/ui/DataPagination.vue';
import type { SchoolAdministrationItem } from '../models/school-administration.model';
import SchoolModeBadge from './SchoolModeBadge.vue';
import SchoolStatusBadge from './SchoolStatusBadge.vue';

defineProps<{
  schools: readonly SchoolAdministrationItem[];
  organizationName: string;
  canMutate: boolean;
  totalItems: number;
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  paginationEnd: number;
  busy: boolean;
  formatDate: (value: string | undefined) => string;
}>();

const emit = defineEmits<{
  (event: 'open', idEcole: string): void;
  (event: 'toggleStatus', school: SchoolAdministrationItem): void;
  (event: 'update:rowsPerPage', value: number): void;
  (event: 'update:currentPage', value: number): void;
}>();

function resetPagination(): void {
  emit('update:rowsPerPage', 10);
  emit('update:currentPage', 1);
}
</script>

<style scoped>
.school-admin-registry{display:grid;gap:1rem}
.school-admin-registry__table-shell{overflow:auto;border-radius:28px;border:1px solid rgba(17,40,63,.08);background:#fff;box-shadow:0 24px 60px rgba(15,23,42,.08)}
.school-admin-registry__table{width:100%;border-collapse:separate;border-spacing:0;min-width:980px}
.school-admin-registry__table th,.school-admin-registry__table td{padding:1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.school-admin-registry__table th{position:sticky;top:0;z-index:1;font-size:.84rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;background:#f8fbff;font-weight:800;backdrop-filter:blur(10px)}
.school-admin-registry__table tbody tr:hover{background:#fbfdff}
.school-admin-registry__identity{display:grid;gap:.22rem}
.school-admin-registry__identity small{color:#587083}
.school-admin-registry__actions{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
.school-admin-registry__action{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:.72rem 1rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#fff;color:#113f67}
.school-admin-registry__action:disabled{opacity:.55;cursor:not-allowed}
.school-admin-registry__mobile-list{display:none}
.school-admin-registry__mobile-card{display:grid;gap:1rem;padding:1.1rem;border-radius:24px;border:1px solid rgba(17,40,63,.08);background:linear-gradient(180deg,rgba(255,255,255,.98),rgba(247,250,255,.95));box-shadow:0 18px 42px rgba(17,40,63,.08)}
.school-admin-registry__mobile-card header{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.school-admin-registry__mobile-card h3{margin:0;color:#10243b}
.school-admin-registry__mobile-card p{margin:.3rem 0 0;color:#587083}
.school-admin-registry__mobile-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem 1rem}
.school-admin-registry__mobile-meta div{display:grid;gap:.15rem}
.school-admin-registry__mobile-meta span{color:#61788a;font-size:.82rem;text-transform:uppercase;letter-spacing:.06em}
.school-admin-registry__mobile-meta strong{color:#10243b}
@media (max-width: 960px){
  .school-admin-registry__table-shell{display:none}
  .school-admin-registry__mobile-list{display:grid;gap:1rem}
}
@media (max-width: 720px){
  .school-admin-registry__mobile-meta{grid-template-columns:1fr}
  .school-admin-registry__actions{flex-direction:column;align-items:stretch}
  .school-admin-registry__action{width:100%}
}
</style>

