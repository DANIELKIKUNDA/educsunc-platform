<template>
  <SectionBlock
    title="Migrations referentielles"
    description="Suivez les migrations entre versions officielles et les actions a confirmer."
  >
    <div class="reference-center__panel">
      <div class="reference-center__panel-head">
        <div>
          <small>{{ vm.migrationsMeta.totalLabel }}</small>
          <strong>{{ vm.migrationsMeta.totalValue }}</strong>
          <p class="reference-center__panel-meta">
            {{ vm.migrationsMeta.totalValue }} sur {{ vm.migrationsMeta.totalAvailable }} disponible(s)
          </p>
        </div>
        <div class="reference-center__stack-actions">
          <label class="reference-center__field reference-center__field--compact">
            <span>Programme concerne</span>
            <input v-model="vm.programmeNiveauLookup" type="text" placeholder="Reference du programme a suivre" />
          </label>
          <button class="reference-center__panel-action" type="button" @click="vm.chargerHistoriqueMigrations">
            <RefreshCw :size="16" />
            Charger
          </button>
          <button class="reference-center__panel-action" type="button" :disabled="!vm.canMigrate" @click="vm.openMigrationModal">
            <ArrowRightLeft :size="16" />
            Analyser
          </button>
        </div>
      </div>

      <EmptyState
        v-if="vm.filteredMigrations.length === 0"
        title="Aucune migration visible"
        message="Renseignez un programme puis chargez son historique pour suivre ses migrations."
      />

      <div v-else class="reference-center__table-shell">
        <table class="reference-center__table">
          <thead>
            <tr>
              <th>Programme</th>
              <th>Version source</th>
              <th>Version cible</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="migration in vm.paginatedMigrations"
              :key="migration.id"
              :class="{ 'reference-center__table-row--selected': vm.selectedMigration?.id === migration.id }"
              @click="vm.ouvrirRapportMigration(migration.id)"
            >
              <td>{{ vm.programmeNiveauLookup || 'Programme selectionne' }}</td>
              <td>{{ vm.readVersionLabel(migration.idAncienneVersionReferentiel) }}</td>
              <td>{{ vm.readVersionLabel(migration.idNouvelleVersionReferentiel) }}</td>
              <td><span class="reference-center__badge" :class="vm.migrationBadgeClass(migration.statut)">{{ migration.statut }}</span></td>
              <td>{{ vm.formatDate(migration.dateMigration) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DataPagination
        v-if="vm.filteredMigrations.length > 0"
        :visible-items="vm.migrationsPaginationEnd"
        :total-items="vm.filteredMigrations.length"
        :rows-per-page="vm.migrationsPagination.rowsPerPage"
        :can-load-more="vm.migrationsPagination.currentPage < vm.migrationsTotalPages"
        :can-reset="vm.migrationsPagination.currentPage > 1"
        @update:rows-per-page="vm.migrationsPagination.rowsPerPage = $event; vm.migrationsPagination.currentPage = 1"
        @load-more="vm.migrationsPagination.currentPage += 1"
        @show-all="vm.migrationsPagination.currentPage = vm.migrationsTotalPages"
        @reset="vm.migrationsPagination.currentPage = 1"
      />

      <div v-if="vm.selectedMigration" class="reference-center__migration-report">
        <header class="reference-center__subsection-head">
          <div>
            <small>Rapport selectionne</small>
            <strong>{{ vm.programmeNiveauLookup || 'Programme selectionne' }}</strong>
          </div>
          <div class="reference-center__stack-actions">
            <button class="reference-center__panel-action" type="button" :disabled="!vm.canMigrate" @click="vm.askApplyMigration(vm.selectedMigration.id)">
              Appliquer
            </button>
            <button class="reference-center__panel-action" type="button" :disabled="!vm.canMigrate" @click="vm.askCancelMigration(vm.selectedMigration.id)">
              Annuler
            </button>
            <button class="reference-center__panel-action" type="button" :disabled="!vm.canMigrate" @click="vm.askRelaunchMigration(vm.selectedMigration.id)">
              Relancer recalcul
            </button>
          </div>
        </header>

        <div class="reference-center__detail-grid">
          <div class="reference-center__detail-item">
            <small>Statut</small>
            <strong>{{ vm.selectedMigration.statut }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Version source</small>
            <strong>{{ vm.readVersionLabel(vm.selectedMigration.idAncienneVersionReferentiel) }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Version cible</small>
            <strong>{{ vm.readVersionLabel(vm.selectedMigration.idNouvelleVersionReferentiel) }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Differences</small>
            <strong>{{ vm.store.state.migrationReport?.totalDifferences ?? vm.selectedMigration.lignesDiffMigration.length }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Transformations</small>
            <strong>{{ vm.store.state.migrationReport?.totalTransformationsNotes ?? vm.selectedMigration.transformationsNotes.length }}</strong>
          </div>
          <div class="reference-center__detail-item">
            <small>Declenche par</small>
            <strong>{{ vm.selectedMigration.declenchePar ?? 'Systeme' }}</strong>
          </div>
        </div>

        <p class="reference-center__report-text">{{ vm.selectedMigration.resumeDiff }}</p>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import { ArrowRightLeft, RefreshCw } from 'lucide-vue-next';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import DataPagination from '../../../shared/ui/DataPagination.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
