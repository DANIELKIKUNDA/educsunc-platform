<template>
  <SectionBlock
    title="Vue d ensemble du centre"
    description="Suivez l etat du referentiel officiel, les publications recentes et les migrations qui meritent une verification."
  >
    <div class="reference-center__context-grid">
      <div
        v-for="card in vm.centerOverviewCards"
        :key="card.label"
        class="reference-center__context-card"
      >
        <small>{{ card.label }}</small>
        <strong>{{ card.value }}</strong>
        <span>{{ card.hint }}</span>
      </div>
    </div>
  </SectionBlock>
</template>

<script setup lang="ts">
import SectionBlock from '../../../shared/layout/SectionBlock.vue';
import { usePlatformOfficialReferenceCenterViewModelContext } from '../viewmodels/usePlatformOfficialReferenceCenterViewModel';

const vm = usePlatformOfficialReferenceCenterViewModelContext();
</script>
