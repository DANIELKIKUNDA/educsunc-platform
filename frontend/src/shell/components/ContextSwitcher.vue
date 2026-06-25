<template>
  <div class="context-switcher">
    <ContextBadge label="Organisation" :value="context.organizationName" />
    <ContextBadge label="Ecole" :value="context.schoolName" />
    <ContextBadge label="Annee" :value="context.schoolYearLabel" />
  </div>
</template>

<script setup lang="ts">
import { activeContextStore } from '../../shared/session/active-context.store';
import ContextBadge from '../../shared/ui/ContextBadge.vue';

const context = activeContextStore.state;
</script>
