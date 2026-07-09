<template>
  <div class="org-schools-table-card">
    <div class="org-schools-table-shell">
      <table class="org-schools-table">
        <thead>
          <tr>
            <th>Code école</th>
            <th>Nom de l'école</th>
            <th>Province éducationnelle</th>
            <th>Sections organisées</th>
            <th>Modules activés</th>
            <th>Statut</th>
            <th>Créée le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ecole in schools" :key="ecole.id">
            <td>
              <div class="org-school-identity">
                <strong>{{ ecole.code }}</strong>
                <small>Version {{ ecole.version }}</small>
              </div>
            </td>
            <td>
              <div class="org-school-identity">
                <strong>{{ ecole.nom }}</strong>
                <small>{{ ecole.modeExploitation }}</small>
              </div>
            </td>
            <td>{{ ecole.provinceEducationnelle || 'Non renseigné' }}</td>
            <td>{{ readSections(ecole) }}</td>
            <td>{{ readModules(ecole) }}</td>
            <td>
              <span :class="['org-school-status', ecole.actif ? 'is-active' : 'is-inactive']">
                {{ ecole.actif ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formatDate(ecole.creeLe) }}</td>
            <td>
              <div class="org-school-actions">
                <button v-if="canView" class="org-school-icon-button" type="button" :disabled="busy" title="Voir" @click="$emit('view', ecole.id)">
                  <Eye :size="16" />
                </button>
                <button v-if="canConfigure" class="org-school-icon-button" type="button" :disabled="busy" title="Configurer" @click="$emit('configure', ecole)">
                  <Settings2 :size="16" />
                </button>
                <button v-if="canToggleStatus" class="org-school-icon-button" type="button" :disabled="busy" :title="ecole.actif ? 'Désactiver' : 'Activer'" @click="$emit('toggle-status', ecole)">
                  <Power :size="16" />
                </button>
                <button v-if="canOpenWorkspace" class="org-school-icon-button" type="button" :disabled="busy" title="Ouvrir l'école" @click="$emit('open-workspace', ecole)">
                  <DoorOpen :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DoorOpen, Eye, Power, Settings2 } from 'lucide-vue-next';
import type { EcoleItem } from '../models/organization-governance.model';

defineProps<{
  schools: readonly EcoleItem[];
  busy: boolean;
  canView: boolean;
  canConfigure: boolean;
  canToggleStatus: boolean;
  canOpenWorkspace: boolean;
  formatDate: (value?: string) => string;
  readSections: (school: EcoleItem) => string;
  readModules: (school: EcoleItem) => string;
}>();

defineEmits<{
  (event: 'view', idSchool: string): void;
  (event: 'configure', school: EcoleItem): void;
  (event: 'toggle-status', school: EcoleItem): void;
  (event: 'open-workspace', school: EcoleItem): void;
}>();
</script>

<style scoped>
.org-schools-table-card{overflow:hidden;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.org-schools-table-shell{overflow:auto}
.org-schools-table{width:100%;border-collapse:separate;border-spacing:0}
.org-schools-table th,.org-schools-table td{padding:1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.org-schools-table th{font-size:.84rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;background:#f8fbff;font-weight:800}
.org-schools-table tbody tr{transition:background-color .18s ease,transform .18s ease}
.org-schools-table tbody tr:hover{background:#fbfdff}
.org-school-identity{display:grid;gap:.22rem}
.org-school-identity small{color:#587083}
.org-school-status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-school-status.is-active{background:#eaf8ef;color:#166534}
.org-school-status.is-inactive{background:#fff2f2;color:#b91c1c}
.org-school-actions{display:flex;flex-wrap:wrap;gap:.6rem}
.org-school-icon-button{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:14px;border:1px solid rgba(17,40,63,.12);background:#fff;color:#17324a}
.org-school-icon-button:hover{background:#f6f9fc}
.org-school-icon-button:disabled{opacity:.65;cursor:not-allowed}
</style>
