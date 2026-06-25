<template>
  <span class="context-badge">
    <small>{{ label }}</small>
    <strong>{{ value }}</strong>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>
