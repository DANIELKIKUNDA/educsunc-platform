<script setup lang="ts">
defineProps<{
  libelle: string;
}>();
</script>

<template>
  <span class="badge-statut">{{ libelle }}</span>
</template>
