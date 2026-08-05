<template>
  <Transition name="route-progress">
    <div
      v-if="progress.visible"
      class="erp-route-progress"
      role="progressbar"
      aria-label="Chargement de la page en cours"
      aria-valuetext="Chargement en cours"
    >
      <span />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { navigationProgressStore } from '../../router/navigation-progress.store';

const progress = navigationProgressStore.state;
</script>
