<template>
  <ActionToolbar
    title="Actions et filtres"
    description="Affinez la lecture du centre et lancez les actions autorisees sans quitter cet espace."
  >
    <template #filters>
      <div class="reference-center__toolbar-filters">
        <label class="reference-center__field reference-center__field--inline reference-center__field--search">
          <span>Recherche</span>
          <input v-model="vm.searchTerm" type="search" placeholder="Section, classe, cours, version, commentaire..." />
        </label>

        <label class="reference-center__field reference-center__field--inline reference-center__field--compact">
          <span>Statut</span>
          <select v-model="vm.statusFilter">
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
        </label>

        <label class="reference-center__field reference-center__field--inline reference-center__field--compact">
          <span>Structure</span>
          <select v-model="vm.structureFilter">
            <option value="all">Toutes</option>
            <option value="TRIMESTRIEL">Trimestrielle</option>
            <option value="SEMESTRIEL">Semestrielle</option>
          </select>
        </label>

        <label
          v-if="vm.store.state.activeTab === 'referentiels' || vm.store.state.activeTab === 'comparaisons'"
          class="reference-center__field reference-center__field--inline reference-center__field--compact"
        >
          <span>Classe academique</span>
          <select v-model="vm.classFilter">
            <option value="">Toutes</option>
            <option v-for="classe in vm.store.state.classesAcademiques" :key="classe.id" :value="classe.id">
              {{ classe.libelle }}
            </option>
          </select>
        </label>
      </div>
    </template>

    <template #actions>
      <div class="reference-center__toolbar-actions">
        <button class="reference-center__ghost-button" type="button" @click="vm.resetFilters">
          Effacer les filtres
        </button>
        <button
          class="reference-center__primary-button"
          type="button"
          :disabled="!vm.canImport"
          @click="vm.ouvrirActionRoute('platform-reference-import')"
        >
          <Upload :size="16" />
          Importer
        </button>
        <button
          class="reference-center__ghost-button"
          type="button"
          :disabled="!vm.canPublish"
          @click="vm.ouvrirActionRoute('platform-reference-publish')"
        >
          <Send :size="16" />
          Publier
        </button>
        <button
          class="reference-center__ghost-button"
          type="button"
          :disabled="!vm.canActivate"
          @click="vm.ouvrirActionRoute('platform-reference-activate')"
        >
          <CircleCheckBig :size="16" />
          Activer
        </button>
        <button
          class="reference-center__ghost-button"
          type="button"
          :disabled="!vm.canCompare"
          @click="vm.ouvrirActionRoute('platform-reference-compare')"
        >
          <GitCompareArrows :size="16" />
          Comparer
        </button>
        <button
          class="reference-center__ghost-button"
          type="button"
          :disabled="!vm.canMigrate"
          @click="vm.ouvrirActionRoute('platform-reference-migrations', true)"
        >
          <ArrowRightLeft :size="16" />
          Migrations
        </button>
      </div>
    </template>
  </ActionToolbar>
</template>

<script setup lang="ts">
import { ArrowRightLeft, CircleCheckBig, GitCompareArrows, Send, Upload } from 'lucide-vue-next';
import ActionToolbar from '../../../shared/ui/ActionToolbar.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
