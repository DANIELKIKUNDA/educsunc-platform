<template><header class="security-section-heading"><div><span>{{ eyebrow }}</span><h2>{{ title }}</h2><p>{{ description }}</p></div><div v-if="$slots.default" class="security-section-heading__actions"><slot /></div></header></template>
<script setup lang="ts">defineProps<{ eyebrow: string; title: string; description: string }>();</script>
