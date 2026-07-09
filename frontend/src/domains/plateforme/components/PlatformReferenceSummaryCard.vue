<template>
  <StatCard
    :icon="icon"
    :label="label"
    :value="value"
    :hint="hint"
    :tone="tone"
    :clickable="clickable"
    :aria-label="ariaLabel"
    @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import StatCard from '../../../shared/ui/StatCard.vue';

defineProps<{
  icon: Component;
  label: string;
  value: string | number;
  hint: string;
  tone?: 'primary' | 'success' | 'warning' | 'neutral';
  clickable?: boolean;
  ariaLabel?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>
