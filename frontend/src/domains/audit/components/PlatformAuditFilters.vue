<template>
  <ActionToolbar
    title="Recherche et filtres"
    description="Affinez la lecture sans élargir le périmètre autorisé de la plateforme."
  >
    <template #header-actions>
      <button class="ui-button ui-button--ghost" type="button" :aria-expanded="open" @click="emit('toggle')">
        <SlidersHorizontal :size="17" aria-hidden="true" />
        {{ open ? 'Réduire' : 'Afficher les filtres' }}
      </button>
    </template>
    <template v-if="open" #filters>
      <div class="audit-filter-grid">
        <label class="audit-field audit-field--wide">
          <span>Action</span>
          <input v-model.trim="model.action" class="ui-field-control" type="search" placeholder="Ex. paiement créé" />
        </label>
        <label class="audit-field">
          <span>Type</span>
          <select v-model="model.typeAuditPrincipal" class="ui-field-control">
            <option value="">Tous les types</option>
            <option v-for="option in typeOptions" :key="option" :value="option">{{ label(option) }}</option>
          </select>
        </label>
        <label class="audit-field">
          <span>Gravité</span>
          <select v-model="model.gravite" class="ui-field-control">
            <option value="">Toutes</option>
            <option v-for="option in severityOptions" :key="option" :value="option">{{ label(option) }}</option>
          </select>
        </label>
        <label class="audit-field">
          <span>Résultat</span>
          <select v-model="model.resultat" class="ui-field-control">
            <option value="">Tous</option>
            <option v-for="option in resultOptions" :key="option" :value="option">{{ label(option) }}</option>
          </select>
        </label>
        <label class="audit-field">
          <span>Du</span>
          <input v-model="model.dateDebut" class="ui-field-control" type="date" />
        </label>
        <label class="audit-field">
          <span>Au</span>
          <input v-model="model.dateFin" class="ui-field-control" type="date" />
        </label>
        <label class="audit-field">
          <span>Acteur</span>
          <input v-model.trim="model.acteurId" class="ui-field-control" type="search" placeholder="Identifiant d’acteur" />
        </label>
        <label class="audit-field">
          <span>Ressource</span>
          <input v-model.trim="model.ressourceId" class="ui-field-control" type="search" placeholder="Identifiant de ressource" />
        </label>
        <label class="audit-field">
          <span>Type de ressource</span>
          <input v-model.trim="model.typeRessource" class="ui-field-control" type="search" placeholder="Ex. paiement" />
        </label>
        <label class="audit-field">
          <span>Catégorie</span>
          <input v-model.trim="model.categorieAudit" class="ui-field-control" type="search" placeholder="Catégorie métier" />
        </label>
        <label class="audit-field">
          <span>Corrélation</span>
          <input v-model.trim="model.correlationId" class="ui-field-control" type="search" placeholder="Identifiant de corrélation" />
        </label>
        <label class="audit-field">
          <span>Demande</span>
          <input v-model.trim="model.requestId" class="ui-field-control" type="search" placeholder="Identifiant de demande" />
        </label>
        <label class="audit-field">
          <span>Source</span>
          <input v-model.trim="model.sourceAudit" class="ui-field-control" type="search" placeholder="Origine de l’événement" />
        </label>
        <label class="audit-field">
          <span>Organisation</span>
          <input v-model.trim="model.organisationId" class="ui-field-control" type="search" placeholder="Filtre plateforme facultatif" />
        </label>
        <label class="audit-field">
          <span>École</span>
          <input v-model.trim="model.ecoleId" class="ui-field-control" type="search" placeholder="Filtre plateforme facultatif" />
        </label>
      </div>
    </template>
    <template v-if="open" #actions>
      <div class="audit-filter-actions">
        <button class="ui-button ui-button--primary" type="button" :disabled="loading" @click="emit('apply')">
          <Search :size="17" aria-hidden="true" />
          {{ loading ? 'Recherche…' : 'Appliquer' }}
        </button>
        <button class="ui-button" type="button" :disabled="loading" @click="emit('reset')">
          <RotateCcw :size="17" aria-hidden="true" />
          Effacer les filtres
        </button>
      </div>
      <div v-if="activeLabels.length" class="audit-filter-chips" aria-label="Filtres actifs">
        <span v-for="item in activeLabels" :key="item" class="ui-badge">{{ item }}</span>
      </div>
    </template>
  </ActionToolbar>
</template>

<script setup lang="ts">
import { RotateCcw, Search, SlidersHorizontal } from 'lucide-vue-next';
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import type { AuditFilterDraft } from '../models/platform-audit.model';

defineProps<{
  open: boolean;
  loading: boolean;
  activeLabels: readonly string[];
  typeOptions: readonly string[];
  severityOptions: readonly string[];
  resultOptions: readonly string[];
}>();
const model = defineModel<AuditFilterDraft>({ required: true });
const emit = defineEmits<{ toggle: []; apply: []; reset: [] }>();

function label(value: string): string {
  return value.toLocaleLowerCase('fr-FR').replaceAll('_', ' ').replace(/^./u, (letter) => letter.toLocaleUpperCase('fr-FR'));
}
</script>
