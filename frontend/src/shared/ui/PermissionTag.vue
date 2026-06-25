<template>
  <span class="permission-tag">{{ label }}</span>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>
