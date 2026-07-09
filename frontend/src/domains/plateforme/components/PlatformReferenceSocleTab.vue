<template>
  <SectionBlock
    :title="vm.socleTitle"
    description="Administrez les structures officielles qui alimentent les referentiels et les usages pedagogiques."
  >
    <div class="reference-center__subtabs">
      <button
        v-for="family in vm.families"
        :key="family.code"
        class="reference-center__subtab"
        :class="{ 'reference-center__subtab--active': vm.store.state.activeFamily === family.code }"
        type="button"
        @click="vm.store.definirFamille(family.code)"
      >
        {{ family.label }}
      </button>
    </div>

    <div class="reference-center__tab-grid">
      <div class="reference-center__panel">
        <div class="reference-center__panel-head">
          <div>
            <small>{{ vm.socleMeta.totalLabel }}</small>
            <strong>{{ vm.socleMeta.totalValue }}</strong>
            <p class="reference-center__panel-meta">
              {{ vm.socleMeta.totalValue }} sur {{ vm.socleMeta.totalAvailable }} disponible(s)
            </p>
          </div>
          <button
            v-if="vm.canMutateCenter"
            class="reference-center__panel-action"
            type="button"
            @click="vm.openSocleCreationModal"
          >
            <Plus :size="16" />
            Ajouter
          </button>
        </div>

        <EmptyState
          v-if="vm.currentSocleRows.length === 0"
          :title="vm.socleMeta.emptyTitle"
          :message="vm.socleMeta.emptyMessage"
        />

        <div v-else class="reference-center__table-shell">
          <table class="reference-center__table">
            <thead>
              <tr>
                <th v-for="column in vm.socleColumns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in vm.paginatedSocleRows"
                :key="row.id"
                :class="{ 'reference-center__table-row--selected': vm.selectedSocleRow?.id === row.id }"
                @click="vm.selectedSocleId = row.id"
              >
                <template v-if="vm.store.state.activeFamily === 'sections'">
                  <td>{{ row.code }}</td>
                  <td>{{ row.libelle }}</td>
                  <td>{{ 'ordreAffichage' in row ? row.ordreAffichage : '-' }}</td>
                  <td><span class="reference-center__badge" :class="vm.badgeClass(row.active)">{{ row.active ? 'Active' : 'Inactive' }}</span></td>
                  <td>{{ row.version }}</td>
                  <td>{{ vm.formatDate(row.modifieLe ?? row.creeLe) }}</td>
                </template>

                <template v-else-if="vm.store.state.activeFamily === 'classes'">
                  <td>{{ row.code }}</td>
                  <td>{{ row.libelle }}</td>
                  <td>{{ 'idSectionScolaire' in row ? vm.readSectionLabel(row.idSectionScolaire) : '-' }}</td>
                  <td>{{ 'typeStructureEvaluation' in row ? row.typeStructureEvaluation : '-' }}</td>
                  <td>{{ 'cycle' in row ? row.cycle : '-' }}</td>
                  <td><span class="reference-center__badge" :class="vm.badgeClass(row.active)">{{ row.active ? 'Active' : 'Inactive' }}</span></td>
                </template>

                <template v-else>
                  <td>{{ row.code }}</td>
                  <td>{{ 'abreviation' in row ? row.abreviation ?? 'Sans abreviation' : '-' }}</td>
                  <td>{{ row.libelle }}</td>
                  <td>{{ 'estTechnique' in row && row.estTechnique ? 'Technique' : 'Generale' }}</td>
                  <td>{{ 'categorieTechnique' in row ? row.categorieTechnique ?? 'Sans categorie' : '-' }}</td>
                  <td><span class="reference-center__badge" :class="vm.badgeClass(row.active)">{{ row.active ? 'Active' : 'Inactive' }}</span></td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>

        <DataPagination
          v-if="vm.currentSocleRows.length > 0"
          :visible-items="vm.soclePaginationEnd"
          :total-items="vm.currentSocleRows.length"
          :rows-per-page="vm.soclePagination.rowsPerPage"
          :can-load-more="vm.soclePagination.currentPage < vm.socleTotalPages"
          :can-reset="vm.soclePagination.currentPage > 1"
          @update:rows-per-page="vm.soclePagination.rowsPerPage = $event; vm.soclePagination.currentPage = 1"
          @load-more="vm.soclePagination.currentPage += 1"
          @show-all="vm.soclePagination.currentPage = vm.socleTotalPages"
          @reset="vm.soclePagination.currentPage = 1"
        />
      </div>

      <div class="reference-center__detail-panel">
        <div class="reference-center__detail-head">
          <small>{{ vm.socleMeta.detailLabel }}</small>
          <strong>{{ vm.selectedSocleTitle }}</strong>
        </div>

        <EmptyState
          v-if="!vm.selectedSocleRow"
          title="Aucun element selectionne"
          message="Selectionnez une ligne pour afficher son detail."
        />

        <div v-else class="reference-center__detail-grid">
          <div class="reference-center__detail-item" v-for="entry in vm.selectedSocleDetails" :key="entry.label">
            <small>{{ entry.label }}</small>
            <strong>{{ entry.value }}</strong>
          </div>
        </div>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import DataPagination from '../../../shared/ui/DataPagination.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
