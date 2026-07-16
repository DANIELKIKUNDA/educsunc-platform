<template>
  <main class="auth-page">
    <div class="auth-page__wash" aria-hidden="true"></div>
    <GraduationCap class="auth-page__sketch auth-page__sketch--cap" aria-hidden="true" />
    <BookOpen class="auth-page__sketch auth-page__sketch--book" aria-hidden="true" />
    <Pencil class="auth-page__sketch auth-page__sketch--pencil" aria-hidden="true" />
    <Landmark class="auth-page__sketch auth-page__sketch--school" aria-hidden="true" />
    <div class="auth-page__books auth-page__books--left" aria-hidden="true"></div>
    <div class="auth-page__books auth-page__books--right" aria-hidden="true"></div>
    <Globe2 class="auth-page__globe" aria-hidden="true" />

    <section class="auth-card" :class="{ 'auth-card--wide': wide }">
      <header class="auth-brand">
        <img
          src="/icons/edusync-icon-standard-192x192.png"
          width="92"
          height="92"
          alt=""
          class="auth-brand__logo"
        />
        <p class="auth-brand__name" aria-label="EduSync">
          <span>Edu</span><strong>Sync</strong>
        </p>
        <h1>{{ title }}</h1>
        <p v-if="description" class="auth-brand__description">{{ description }}</p>
      </header>
      <slot />
    </section>
  </main>
</template>

<script setup lang="ts">
import { BookOpen, Globe2, GraduationCap, Landmark, Pencil } from 'lucide-vue-next';

defineProps<{
  title: string;
  description?: string;
  wide?: boolean;
}>();
</script>
