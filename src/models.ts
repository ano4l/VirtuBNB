export type PropertyStatus = 'Occupied' | 'Ready' | 'Turnover';
export type SyncHealth = 'Healthy' | 'Attention';
export type TaskStatus = 'open' | 'completed';
export type ActivityKind = 'user' | 'automation' | 'sync' | 'failure';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
import type { ImageSourcePropType } from 'react-native';

export interface Property {
  id: string;
  name: string;
  area: string;
  status: PropertyStatus;
  occupancy: string;
  nextStay: string;
  syncHealth: SyncHealth;
  syncLabel: string;
  accent: string;
  icon: 'business-outline' | 'bed-outline';
  listingStatus: string;
  activeWorkflows: string[];
  baseNotes: string[];
  image: ImageSourcePropType;
  description: string;
  checkInTime: string;
  automationEnabled: boolean;
}

export interface Review {
  id: string; propertyId: string; reviewer: string; date: string; rating: number;
  excerpt: string; responseStatus: 'Needs reply' | 'Replied'; source: 'Sample Airbnb data';
}

export interface AssistantMessage {
  id: string; role: 'user' | 'assistant'; text: string;
  action?: { label: string; route: string };
}

export interface TimelineEvent {
  id: string;
  time: string;
  propertyId: string;
  title: string;
  detail: string;
  kind: 'arrival' | 'checkout' | 'task';
  taskId?: string;
}

export interface HostTask {
  id: string;
  title: string;
  propertyId: string;
  due: string;
  assignee: string;
  status: TaskStatus;
  overdue?: boolean;
  category: 'Cleaning' | 'Maintenance';
}

export interface Approval {
  code?: string;
  kind?: 'listing_text' | 'listing_photo';
  id: string;
  propertyId: string;
  field: string;
  before: string;
  after: string;
  requestedBy: string;
  expires: string;
  status: ApprovalStatus;
  changes?: { field: string; before: string; after: string }[];
  localDraft?: Partial<Pick<Property, 'name' | 'description' | 'checkInTime' | 'status' | 'automationEnabled'>>;
  localOnly?: boolean;
}

export interface Activity {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  time: string;
  retryable?: boolean;
  retried?: boolean;
}
