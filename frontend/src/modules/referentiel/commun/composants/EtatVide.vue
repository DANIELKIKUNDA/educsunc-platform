<script setup lang="ts">
defineProps<{
  titre: string;
  message: string;
}>();
</script>

<template>
  <section class="section-referentiel">
    <h3>{{ titre }}</h3>
    <p>{{ message }}</p>
  </section>
</template>
