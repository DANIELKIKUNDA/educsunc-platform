<template>
  <PageContainer>
    <PageHeader
      eyebrow="Plateforme"
      title="Referentiel officiel"
      description="Centralisez le socle officiel, les cours, les versions publiees et le suivi des migrations dans un seul espace de pilotage."
    >
      <template #actions>
        <div class="reference-center__header-actions">
          <span class="reference-center__context-chip">
            <span class="reference-center__context-dot" />
            Plateforme
          </span>
          <button class="reference-center__ghost-button" type="button" @click="vm.recharger">
            <RefreshCw :size="16" />
            Actualiser
          </button>
        </div>
      </template>
    </PageHeader>

    <PlatformReferenceContextPanel />

    <ErrorState
      v-if="!vm.canReadCenter"
      title="Acces refuse"
      message="Le centre Referentiel officiel reste reserve aux acteurs plateforme autorises."
    />

    <template v-else>
      <div class="reference-center__summary-grid">
        <PlatformReferenceSummaryCard
          v-for="item in vm.summaryCards"
          :key="item.code"
          :icon="item.icon"
          :label="item.label"
          :value="item.value"
          :hint="item.hint"
          :tone="item.tone"
          clickable
          :aria-label="`Ouvrir ${item.label}`"
          @click="vm.ouvrirCarteSynthese(item.code)"
        />
      </div>

      <PlatformReferenceToolbar />

      <PremiumTabs
        :ariaLabel="'Navigation du centre referentiel'"
        :model-value="vm.store.state.activeTab"
        :tabs="vm.tabs"
        @update:model-value="handleTabChange"
      />

      <div v-if="vm.store.state.bootStatus === 'loading'" class="reference-center__loading-shell" aria-hidden="true">
        <div class="reference-center__loading-header" />
        <div class="reference-center__loading-toolbar">
          <div class="reference-center__loading-filter" />
          <div class="reference-center__loading-filter" />
          <div class="reference-center__loading-filter" />
          <div class="reference-center__loading-filter" />
        </div>
        <div class="reference-center__loading-grid">
          <div class="reference-center__loading-panel" />
          <div class="reference-center__loading-panel" />
        </div>
      </div>

      <ErrorState
        v-else-if="vm.store.state.bootStatus === 'error'"
        title="Centre indisponible"
        :message="vm.store.state.bootErrorMessage ?? 'Le centre referentiel officiel ne peut pas etre charge pour le moment.'"
      />

      <template v-else>
        <PlatformReferenceSocleTab v-if="vm.store.state.activeTab === 'socle'" />
        <PlatformReferenceCoursesTab v-else-if="vm.store.state.activeTab === 'cours'" />
        <PlatformReferenceReferentialsTab v-else-if="vm.store.state.activeTab === 'referentiels'" />
        <PlatformReferenceComparisonsTab v-else-if="vm.store.state.activeTab === 'comparaisons'" />
        <PlatformReferenceMigrationsTab v-else />
      </template>
    </template>

    <PlatformReferenceActionModals />
  </PageContainer>
</template>

<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next';
import PageContainer from '../../../shared/layout/PageContainer.vue';
import PageHeader from '../../../shared/layout/PageHeader.vue';
import ErrorState from '../../../shared/ui/ErrorState.vue';
import PremiumTabs from '../../../shared/ui/PremiumTabs.vue';
import PlatformReferenceActionModals from '../components/PlatformReferenceActionModals.vue';
import PlatformReferenceComparisonsTab from '../components/PlatformReferenceComparisonsTab.vue';
import PlatformReferenceContextPanel from '../components/PlatformReferenceContextPanel.vue';
import PlatformReferenceCoursesTab from '../components/PlatformReferenceCoursesTab.vue';
import PlatformReferenceMigrationsTab from '../components/PlatformReferenceMigrationsTab.vue';
import PlatformReferenceReferentialsTab from '../components/PlatformReferenceReferentialsTab.vue';
import PlatformReferenceSocleTab from '../components/PlatformReferenceSocleTab.vue';
import PlatformReferenceSummaryCard from '../components/PlatformReferenceSummaryCard.vue';
import PlatformReferenceToolbar from '../components/PlatformReferenceToolbar.vue';
import {
  providePlatformOfficialReferenceCenterViewModel,
  usePlatformOfficialReferenceCenterViewModel,
} from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModel();

function handleTabChange(value: string): void {
  vm.selectTab(value as never);
}

providePlatformOfficialReferenceCenterViewModel(vm);
</script>

<style src="../components/platform-reference-center.css"></style>
