<template>
  <SectionBlock
    title="Pilotage de l'organisation selectionnee"
    description="Une organisation selectionnee ouvre la lecture de ses ecoles, puis l'enchainement vers l'administration locale."
  >
    <div class="org-detail-grid">
      <article class="org-detail-card">
        <small>Organisation cible</small>
        <strong>{{ selectedOrganisation?.nom ?? 'Aucune organisation selectionnee' }}</strong>
        <span>{{ selectedOrganisation ? `${selectedOrganisation.code} - ${selectedOrganisation.typeOrganisation}` : 'Selectionnez une ligne du registre pour continuer.' }}</span>
      </article>
      <article class="org-detail-card">
        <small>Statut</small>
        <strong>{{ selectedOrganisation ? (selectedOrganisation.actif ? 'Active' : 'Inactive') : 'N/A' }}</strong>
        <span>{{ selectedOrganisation ? lirePromoteur(selectedOrganisation) : 'Promoteur non disponible' }}</span>
      </article>
      <article class="org-detail-card">
        <small>Ecoles chargees</small>
        <strong>{{ ecoles.length }}</strong>
        <span>Projection actuelle du backend pour l'organisation cible</span>
      </article>
    </div>

    <div class="org-projection-actions">
      <button class="org-ghost-button" type="button" :disabled="!selectedOrganisationId" @click="$emit('loadSchools')">
        <Building2 :size="16" />
        <span>Lire les ecoles</span>
      </button>
      <button class="org-ghost-button" type="button" :disabled="!selectedOrganisationId" @click="$emit('activateContext')">
        <Layers3 :size="16" />
        <span>Activer le contexte organisation</span>
      </button>
      <button class="org-primary-button org-primary-button--secondary" type="button" :disabled="!selectedOrganisationId" @click="$emit('openAdministration')">
        <School :size="16" />
        <span>Administrer les ecoles</span>
      </button>
    </div>

    <label v-if="canMutateOrganisation" class="org-inline-field">
      <span>Nouveau nom de l'organisation</span>
      <div class="org-inline-field__row">
        <input :value="renameOrganisationTarget" type="text" placeholder="Nouveau libelle" @input="$emit('update:renameOrganisationTarget', ($event.target as HTMLInputElement).value)" />
        <button
          class="org-ghost-button"
          type="button"
          :disabled="!selectedOrganisationId || !renameOrganisationTarget.trim()"
          @click="$emit('rename')"
        >
          <Pencil :size="16" />
          <span>Renommer</span>
        </button>
      </div>
    </label>

    <EmptyState
      v-if="ecoles.length === 0"
      title="Aucune ecole chargee"
      message="Selectionnez une organisation puis relancez la lecture des ecoles pour ouvrir la projection locale."
    />
    <div v-else class="org-table-card org-table-card--nested">
      <div class="org-table-shell">
        <table class="org-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Ecole</th>
              <th>Mode</th>
              <th>Statut</th>
              <th>Action</th>
              <th>Pilotage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecole in ecoles" :key="ecole.id">
              <td>{{ ecole.code }}</td>
              <td>{{ ecole.nom }}</td>
              <td>{{ ecole.modeExploitation }}</td>
              <td>
                <span :class="['org-status-badge', ecole.actif ? 'is-active' : 'is-inactive']">
                  {{ ecole.actif ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <RouterLink class="org-inline-link" :to="`/app/organisation/ecoles/${ecole.id}`">Ouvrir</RouterLink>
              </td>
              <td>
                <RouterLink class="org-inline-link" :to="`/app/administration-ecole/ecoles/${ecole.id}`">Administrer</RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import { Building2, Layers3, Pencil, School } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import type { EcoleItem, OrganisationItem } from '../models/organization-governance.model';

defineProps<{
  selectedOrganisation: OrganisationItem | null;
  selectedOrganisationId: string;
  renameOrganisationTarget: string;
  canMutateOrganisation: boolean;
  ecoles: readonly EcoleItem[];
  lirePromoteur: (organisation: OrganisationItem) => string;
}>();

defineEmits<{
  (event: 'loadSchools'): void;
  (event: 'activateContext'): void;
  (event: 'openAdministration'): void;
  (event: 'rename'): void;
  (event: 'update:renameOrganisationTarget', value: string): void;
}>();
</script>

<style scoped>
.org-detail-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.org-detail-card{display:grid;gap:.35rem;padding:1rem 1.1rem;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.org-detail-card small{color:#587083;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.org-detail-card strong{font-size:1.4rem;color:#11283f}
.org-detail-card span{color:#587083;line-height:1.45}
.org-projection-actions,.org-inline-field__row{display:flex;flex-wrap:wrap;gap:.6rem;align-items:center}
.org-inline-field{display:grid;gap:.45rem;margin-top:1rem}
.org-inline-field span{font-size:.85rem;font-weight:700;color:#4b6475}
.org-inline-field input{border-radius:18px;border:1px solid rgba(17,40,63,.12);padding:.9rem 1rem;background:#fbfdff;font:inherit;color:#11283f}
.org-primary-button,.org-ghost-button,.org-inline-link{display:inline-flex;align-items:center;gap:.5rem;text-decoration:none;font-weight:600;border-radius:999px;padding:.82rem 1.15rem;border:1px solid rgba(17,40,63,.12);background:#fff;color:#11283f}
.org-primary-button--secondary{background:linear-gradient(135deg,#0f766e,#0ea5a4);border-color:transparent;color:#fff}
.org-ghost-button{background:#f8fbff}
.org-table-card{margin-top:1.1rem;overflow:hidden;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.08);border-radius:28px}
.org-table-shell{overflow:auto}
.org-table{width:100%;border-collapse:separate;border-spacing:0}
.org-table th,.org-table td{padding:1rem;border-bottom:1px solid rgba(17,40,63,.08);text-align:left;vertical-align:top}
.org-table th{font-size:.84rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;background:#f8fbff;font-weight:800}
.org-status-badge{display:inline-flex;align-items:center;border-radius:999px;padding:.38rem .78rem;font-weight:700;font-size:.82rem}
.org-status-badge.is-active{background:#eaf8ef;color:#166534}
.org-status-badge.is-inactive{background:#fff1f1;color:#b91c1c}
.org-inline-link{padding:.55rem .9rem}
@media (max-width: 720px){
  .org-projection-actions,.org-inline-field__row{flex-direction:column;align-items:stretch}
  .org-table th,.org-table td{padding:.82rem}
}
</style>
