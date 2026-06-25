<template>
  <div class="stat-chip">
    <span class="stat-chip__label">{{ label }}</span>
    <strong class="stat-chip__value">{{ value }}</strong>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>
