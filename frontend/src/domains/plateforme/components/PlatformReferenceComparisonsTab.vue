<template>
  <SectionBlock
    title="Comparaisons de versions"
    description="Analysez les ecarts entre deux versions officielles avant toute publication ou activation."
  >
    <div class="reference-center__panel">
      <div class="reference-center__panel-head">
        <div>
          <small>Differences detectees</small>
          <strong>{{ vm.comparisonStats.total }}</strong>
        </div>
        <button class="reference-center__panel-action" type="button" :disabled="!vm.canCompare" @click="vm.ouvrirActionRoute('platform-reference-compare')">
          <GitCompareArrows :size="16" />
          Lancer une comparaison
        </button>
      </div>

      <div class="reference-center__stats-inline" v-if="vm.store.differencesComparaison.value.length > 0">
        <span class="reference-center__inline-chip">Ajouts {{ vm.comparisonStats.added }}</span>
        <span class="reference-center__inline-chip">Suppressions {{ vm.comparisonStats.removed }}</span>
        <span class="reference-center__inline-chip">Ordres modifies {{ vm.comparisonStats.reordered }}</span>
        <span class="reference-center__inline-chip">Ponderations modifiees {{ vm.comparisonStats.weighted }}</span>
      </div>

      <EmptyState
        v-if="vm.store.differencesComparaison.value.length === 0"
        title="Aucune comparaison lancee"
        message="Lancez une comparaison pour afficher les ecarts entre deux versions."
      />

      <div v-else class="reference-center__table-shell">
        <table class="reference-center__table">
          <thead>
            <tr>
              <th>Type diff</th>
              <th>Cours</th>
              <th>Ancien ordre</th>
              <th>Nouvel ordre</th>
              <th>Commentaire</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="difference in vm.store.differencesComparaison.value"
              :key="`${difference.codeCours}-${difference.typeDiff}-${difference.commentaire}`"
              :class="{ 'reference-center__table-row--selected': vm.selectedDifferenceKey === vm.differenceKey(difference) }"
              @click="vm.selectedDifferenceKey = vm.differenceKey(difference)"
            >
              <td>{{ difference.typeDiff ?? 'Diff' }}</td>
              <td>{{ difference.codeCours ?? difference.idReferentielCours ?? 'Cours' }}</td>
              <td>{{ difference.ancienOrdre ?? '-' }}</td>
              <td>{{ difference.nouvelOrdre ?? '-' }}</td>
              <td>{{ difference.commentaire ?? vm.resumeDifference(difference) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="vm.selectedDifference" class="reference-center__comparison-detail">
        <div class="reference-center__detail-item">
          <small>Type</small>
          <strong>{{ vm.selectedDifference.typeDiff ?? 'Diff' }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Cours</small>
          <strong>{{ vm.selectedDifference.codeCours ?? vm.selectedDifference.idReferentielCours ?? 'Cours' }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Ponderation source</small>
          <strong>{{ vm.selectedDifference.anciennePonderation ? vm.resumePonderation(vm.selectedDifference.anciennePonderation) : 'Sans changement' }}</strong>
        </div>
        <div class="reference-center__detail-item">
          <small>Ponderation cible</small>
          <strong>{{ vm.selectedDifference.nouvellePonderation ? vm.resumePonderation(vm.selectedDifference.nouvellePonderation) : 'Sans changement' }}</strong>
        </div>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import { GitCompareArrows } from 'lucide-vue-next';
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import EmptyState from '../../../shared/ui/EmptyState.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
