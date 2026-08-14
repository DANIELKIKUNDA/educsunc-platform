import { sessionStore } from '../../../shared/auth/session.store';
export type MonitoringPermission =
  | 'monitoring.read' | 'monitoring.dashboard.read' | 'monitoring.observability.read' | 'monitoring.health.read'
  | 'monitoring.incidents.read' | 'monitoring.incidents.create' | 'monitoring.incidents.escalate'
  | 'monitoring.alerts.read' | 'monitoring.alerts.create' | 'monitoring.alerts.resolve'
  | 'monitoring.diagnostics.read' | 'monitoring.diagnostics.create'
  | 'monitoring.capacity.read' | 'monitoring.capacity.calculate' | 'monitoring.saturation.calculate'
  | 'monitoring.traces.read' | 'monitoring.traces.create';
export const hasMonitoringPermission = (permission: MonitoringPermission): boolean => sessionStore.state.permissions.includes(permission);
