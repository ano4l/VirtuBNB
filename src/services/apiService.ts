import type * as Domain from '../../../api/src/domain/types';
import type { Activity, Approval, HostTask, Property, TimelineEvent } from '@/src/models';

export type HostSnapshot = {
  properties: Property[]; tasks: HostTask[]; approvals: Approval[]; activity: Activity[];
  briefing: string; syncedAt: string; timeline: TimelineEvent[];
};
type ApiSnapshot = {
  properties: Domain.Property[]; tasks: Domain.Task[]; approvals: Domain.Approval[];
  activities: Domain.Activity[]; dashboard: Domain.Dashboard; syncedAt: string;
};

export class HostApi {
  private token = '';
  constructor(readonly baseUrl: string) {}
  private async request<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST'): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method, signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? (response.status === 401 ? 'Session expired. Connect your workspace again.' : 'The request could not be completed.'));
      }
      return response.status === 204 ? undefined as T : await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw new Error('Connection timed out. Your last saved data is still shown.');
      throw error;
    } finally { clearTimeout(timeout); }
  }
  async pair(code: string) {
    const session = await this.request<{ token: string }>('/auth/pair', { code });
    this.token = session.token;
  }
  async disconnect() { try { await this.request('/api/session', undefined, 'DELETE'); } finally { this.token = ''; } }
  async completeTask(id: string) { await this.request(`/api/tasks/${encodeURIComponent(id)}/complete`, {}); }
  async decideApproval(id: string, decision: 'approved' | 'rejected') { await this.request(`/api/approvals/${encodeURIComponent(id)}/decision`, { decision }); }
  async retryActivity(id: string) { await this.request(`/api/activity/${encodeURIComponent(id)}/retry`, {}); }
  async snapshot(): Promise<HostSnapshot> {
    const data = await this.request<ApiSnapshot>('/api/snapshot');
    if (![data.properties, data.tasks, data.approvals, data.activities].every(Array.isArray)) throw new Error('The server returned an invalid workspace.');
    return {
      properties: data.properties.map((property) => ({
        id: property.id, name: property.name, area: 'Johannesburg · shared demo workspace',
        status: property.status === 'occupied' ? 'Occupied' : property.status === 'turnover' ? 'Turnover' : 'Ready',
        occupancy: 'Demo reservation data', nextStay: property.nextStay,
        syncHealth: property.syncStatus === 'healthy' ? 'Healthy' : 'Attention', syncLabel: 'PMS not connected',
        accent: '#BED7C9', icon: 'business-outline', listingStatus: 'Demo listing. Not connected to Airbnb.',
        activeWorkflows: [], baseNotes: ['Listing publication is not enabled.'],
        image: property.id === 'sandton-studio' ? require('../../assets/properties/sandton-studio.png') : require('../../assets/properties/rosebank-loft.png'),
        description: 'Imported listing summary. Edit locally and stage any provider change for approval.',
        checkInTime: '15:00', automationEnabled: false,
      })),
      tasks: data.tasks.map((task) => ({ id: task.id, title: task.title, propertyId: task.propertyId,
        due: task.dueLabel, assignee: task.assignee, status: task.status === 'completed' ? 'completed' : 'open',
        overdue: task.status === 'overdue', category: /clean/i.test(task.title) ? 'Cleaning' : 'Maintenance' })),
      approvals: data.approvals.map((approval) => ({ ...approval,
        status: approval.status === 'pending' && Date.parse(approval.expiresAt) <= Date.now() ? 'expired' : approval.status,
        expires: new Date(approval.expiresAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }),
      })),
      activity: data.activities.map((activity) => ({ ...activity, kind: activity.type,
        time: new Date(activity.occurredAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Johannesburg' }),
      })),
      briefing: data.dashboard.briefing, syncedAt: data.syncedAt,
      timeline: data.tasks.map((task) => ({ id: task.id, time: task.dueLabel.replace('Today, ', ''),
        propertyId: task.propertyId, title: task.title, detail: task.assignee, kind: 'task', taskId: task.id })),
    };
  }
}
