<template>
  <div class="org-school-mobile-list">
    <article v-for="ecole in schools" :key="ecole.id" class="org-school-mobile-card">
      <div class="org-school-mobile-card__top">
        <div>
          <small>{{ ecole.code }}</small>
          <h3>{{ ecole.nom }}</h3>
          <p>{{ ecole.modeExploitation }}</p>
        </div>
        <span :class="['org-school-mobile-card__status', ecole.actif ? 'is-active' : 'is-inactive']">
          {{ ecole.actif ? 'Active' : 'Inactive' }}
        </span>
      </div>

      <div class="org-school-mobile-card__grid">
        <div>
          <span>Province</span>
          <strong>{{ ecole.provinceEducationnelle || 'Non renseigné' }}</strong>
        </div>
        <div>
          <span>Sections</span>
          <strong>{{ readSections(ecole) }}</strong>
        </div>
        <div>
          <span>Modules</span>
          <strong>{{ readModules(ecole) }}</strong>
        </div>
        <div>
          <span>Créée le</span>
          <strong>{{ formatDate(ecole.creeLe) }}</strong>
        </div>
      </div>

      <div class="org-school-mobile-card__actions">
        <button v-if="canView" class="org-school-mobile-card__button" type="button" :disabled="busy" @click="$emit('view', ecole.id)">Voir</button>
        <button v-if="canConfigure" class="org-school-mobile-card__button" type="button" :disabled="busy" @click="$emit('configure', ecole)">Configurer</button>
        <button v-if="canToggleStatus" class="org-school-mobile-card__button" type="button" :disabled="busy" @click="$emit('toggle-status', ecole)">
          {{ ecole.actif ? 'Désactiver' : 'Activer' }}
        </button>
        <button v-if="canOpenWorkspace" class="org-school-mobile-card__button org-school-mobile-card__button--primary" type="button" :disabled="busy" @click="$emit('open-workspace', ecole)">
          Ouvrir l'école
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
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
.org-school-mobile-list{display:grid;gap:1rem}
.org-school-mobile-card{padding:1rem 1.05rem;border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 18px 36px rgba(15,23,42,.08)}
.org-school-mobile-card__top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start}
.org-school-mobile-card__top small{color:#5f7587;font-weight:700}
.org-school-mobile-card__top h3{margin:.25rem 0;font-size:1.05rem;color:#11283f}
.org-school-mobile-card__top p{margin:0;color:#587083}
.org-school-mobile-card__status{display:inline-flex;align-items:center;border-radius:999px;padding:.42rem .8rem;font-weight:700}
.org-school-mobile-card__status.is-active{background:#eaf8ef;color:#166534}
.org-school-mobile-card__status.is-inactive{background:#fff2f2;color:#b91c1c}
.org-school-mobile-card__grid{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:1rem}
.org-school-mobile-card__grid span{display:block;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:#5f7587;font-weight:700}
.org-school-mobile-card__grid strong{color:#11283f}
.org-school-mobile-card__actions{display:grid;grid-template-columns:1fr 1fr;gap:.7rem;margin-top:1rem}
.org-school-mobile-card__button{border-radius:16px;padding:.82rem .9rem;font-weight:700;border:1px solid rgba(17,40,63,.12);background:#f8fbff;color:#11283f}
.org-school-mobile-card__button--primary{background:linear-gradient(135deg,#1147d8,#2563eb);border-color:transparent;color:#fff}
.org-school-mobile-card__button:disabled{opacity:.65}
@media (max-width: 420px){
  .org-school-mobile-card__grid,.org-school-mobile-card__actions{grid-template-columns:1fr}
  .org-school-mobile-card__top{flex-direction:column}
}
</style>
