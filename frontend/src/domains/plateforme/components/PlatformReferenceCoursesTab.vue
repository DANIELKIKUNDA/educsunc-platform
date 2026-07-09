<template>
  <SectionBlock
    title="Cours officiels"
    description="Consultez le catalogue officiel des cours, leur classement et leur disponibilite."
  >
    <div class="reference-center__panel">
      <div class="reference-center__panel-head">
        <div>
          <small>{{ vm.coursesMeta.totalLabel }}</small>
          <strong>{{ vm.coursesMeta.totalValue }}</strong>
          <p class="reference-center__panel-meta">
            {{ vm.coursesMeta.totalValue }} sur {{ vm.coursesMeta.totalAvailable }} disponible(s)
          </p>
        </div>
        <button class="reference-center__panel-action" type="button" :disabled="!vm.canImport" @click="vm.openImportModal('cours')">
          <Upload :size="16" />
          Importer
        </button>
      </div>

      <EmptyState
        v-if="vm.filteredCourses.length === 0"
        title="Aucun cours officiel"
        message="Le catalogue ne contient encore aucun cours exploitable."
      />

      <div v-else class="reference-center__table-shell">
        <table class="reference-center__table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Libelle</th>
              <th>Abreviation</th>
              <th>Domaine</th>
              <th>Sous-domaine</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="course in vm.paginatedCourses"
              :key="course.id"
              :class="{ 'reference-center__table-row--selected': vm.selectedCourse?.id === course.id }"
              @click="vm.selectedCourseId = course.id"
            >
              <td>{{ course.code }}</td>
              <td>{{ course.libelle }}</td>
              <td>{{ course.abreviation ?? 'Sans abreviation' }}</td>
              <td>{{ course.domaine ?? 'Sans domaine' }}</td>
              <td>{{ course.sousDomaine ?? 'Sans sous-domaine' }}</td>
              <td><span class="reference-center__badge" :class="vm.badgeClass(course.actif)">{{ course.actif ? 'Actif' : 'Inactif' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <DataPagination
        v-if="vm.filteredCourses.length > 0"
        :visible-items="vm.coursesPaginationEnd"
        :total-items="vm.filteredCourses.length"
        :rows-per-page="vm.coursesPagination.rowsPerPage"
        :can-load-more="vm.coursesPagination.currentPage < vm.coursesTotalPages"
        :can-reset="vm.coursesPagination.currentPage > 1"
        @update:rows-per-page="vm.coursesPagination.rowsPerPage = $event; vm.coursesPagination.currentPage = 1"
        @load-more="vm.coursesPagination.currentPage += 1"
        @show-all="vm.coursesPagination.currentPage = vm.coursesTotalPages"
        @reset="vm.coursesPagination.currentPage = 1"
      />

      <div v-if="vm.selectedCourse" class="reference-center__course-detail">
        <div class="reference-center__detail-item" v-for="entry in vm.selectedCourseDetails" :key="entry.label">
          <small>{{ entry.label }}</small>
          <strong>{{ entry.value }}</strong>
        </div>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import { Upload } from 'lucide-vue-next';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import DataPagination from '../../../shared/ui/DataPagination.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
