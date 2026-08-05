<template>
  <Teleport to="body">
    <div v-if="notifications.length > 0" class="toast-stack" aria-label="Notifications">
      <article
        v-for="notification in notifications"
        :key="notification.id"
        class="toast-card"
        :class="`toast-card--${notification.type}`"
        :role="notification.type === 'danger' ? 'alert' : 'status'"
        :aria-live="notification.type === 'danger' ? 'assertive' : 'polite'"
      >
        <div class="toast-card__accent" />
        <div class="toast-card__icon" aria-hidden="true">
          <component :is="lireIcone(notification.type)" :size="18" />
        </div>
        <div class="toast-card__content">
          <strong>{{ notification.titre }}</strong>
          <p>{{ notification.message }}</p>
          <div v-if="notification.actions?.length" class="toast-card__actions">
            <button
              v-for="action in notification.actions"
              :key="action.libelle"
              type="button"
              @click="notificationsService.executerAction(notification.id, action.action)"
            >
              {{ action.libelle }}
            </button>
          </div>
        </div>
        <button
          class="toast-card__close"
          type="button"
          aria-label="Fermer la notification"
          @click="notificationsService.retirer(notification.id)"
        >
          <X :size="16" aria-hidden="true" />
        </button>
      </article>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Info, OctagonAlert, TriangleAlert, X } from 'lucide-vue-next';
import { notificationsService, type NotificationMessage } from '../../services/notifications.service';

const notifications = computed(() => notificationsService.notifications.value);

function lireIcone(type: NotificationMessage['type']) {
  switch (type) {
    case 'succes': return CheckCircle2;
    case 'danger': return OctagonAlert;
    case 'attention': return TriangleAlert;
    default: return Info;
  }
}
</script>

<style scoped>
.toast-stack{position:fixed;top:1.25rem;right:1.25rem;z-index:var(--ui-z-toast);display:grid;gap:.9rem;width:min(430px,calc(100vw - 2rem));pointer-events:none}
.toast-card{pointer-events:auto;position:relative;display:grid;grid-template-columns:4px auto minmax(0,1fr) auto;align-items:start;gap:.9rem;padding:1rem 1rem 1rem 0;border-radius:var(--ui-radius-lg);border:1px solid var(--ui-border);background:color-mix(in srgb,var(--ui-surface) 92%,transparent);backdrop-filter:blur(22px);box-shadow:var(--ui-shadow-lg);overflow:hidden;transform-origin:top right;animation:toast-enter var(--ui-motion-standard)}
.toast-card__accent{align-self:stretch;border-radius:999px;margin:.35rem 0 .35rem .35rem}
.toast-card__icon{display:grid;place-items:center;width:2.45rem;height:2.45rem;border-radius:var(--ui-radius-md);margin-top:.2rem;background:color-mix(in srgb,var(--ui-surface) 74%,transparent)}
.toast-card__content{display:grid;gap:.28rem;min-width:0}
.toast-card__content strong{color:var(--ui-text-strong);font-size:1rem;line-height:1.25}
.toast-card__content p{margin:0;color:var(--ui-text-muted);line-height:1.55}
.toast-card__close{display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;margin-top:.1rem;border:0;border-radius:var(--ui-radius-sm);background:transparent;color:var(--ui-text-muted);cursor:pointer;transition:background var(--ui-motion-fast),color var(--ui-motion-fast)}
.toast-card__close:hover{background:var(--ui-surface-muted);color:var(--ui-text-strong)}
.toast-card__actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.35rem}
.toast-card__actions button{min-height:2.1rem;padding:.4rem .7rem;border:1px solid var(--ui-border-strong);border-radius:999px;background:var(--ui-surface);color:var(--ui-text-strong);font-weight:750;cursor:pointer}
.toast-card__actions button:hover{border-color:var(--ui-primary);color:var(--ui-primary)}
.toast-card--succes{background:linear-gradient(180deg,var(--ui-success-soft),var(--ui-surface))}
.toast-card--succes .toast-card__accent,.toast-card--succes .toast-card__icon{background:var(--ui-success);color:#fff}
.toast-card--danger{background:linear-gradient(180deg,var(--ui-danger-soft),var(--ui-surface))}
.toast-card--danger .toast-card__accent,.toast-card--danger .toast-card__icon{background:var(--ui-danger);color:#fff}
.toast-card--info{background:linear-gradient(180deg,var(--ui-info-soft),var(--ui-surface))}
.toast-card--info .toast-card__accent,.toast-card--info .toast-card__icon{background:var(--ui-info);color:#fff}
.toast-card--attention{background:linear-gradient(180deg,var(--ui-warning-soft),var(--ui-surface))}
.toast-card--attention .toast-card__accent,.toast-card--attention .toast-card__icon{background:var(--ui-warning);color:#fff}
@keyframes toast-enter{from{opacity:0;transform:translateY(-10px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
@media (max-width:720px){.toast-stack{left:1rem;right:1rem;width:auto;top:1rem}.toast-card{grid-template-columns:4px auto minmax(0,1fr);padding-right:.7rem}.toast-card__close{grid-column:3;justify-self:end}}
</style>
