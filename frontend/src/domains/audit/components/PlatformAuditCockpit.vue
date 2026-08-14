<template>
  <section class="audit-center__summary" aria-label="Synthèse du journal chargé">
    <StatCard
      v-for="(card, index) in cards"
      :key="card.label"
      :icon="icons[index] ?? Activity"
      :label="card.label"
      :value="card.value"
      :hint="card.hint"
      :tone="tones[index] ?? 'neutral'"
    />
  </section>
</template>

<script setup lang="ts">
import { Activity, CircleAlert, FileClock, ShieldAlert } from 'lucide-vue-next';
import StatCard from '../../../shared/ui/StatCard.vue';

defineProps<{
  cards: readonly { readonly label: string; readonly value: string; readonly hint: string }[];
}>();

const icons = [FileClock, ShieldAlert, Activity, CircleAlert];
const tones = ['primary', 'warning', 'neutral', 'warning'] as const;
</script>
