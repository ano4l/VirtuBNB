import React, { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { initialActivity, initialApproval, initialTasks, properties, reviews, timelineEvents } from '@/src/data/demo';
import { demoService } from '@/src/services/demoService';
import { HostApi, HostSnapshot } from '@/src/services/apiService';
import type { Approval, AssistantMessage, Property, Review } from '@/src/models';

interface AppStateValue extends HostSnapshot {
  onboardingComplete: boolean;
  reviews: Review[];
  messages: AssistantMessage[];
  assistantBusy: boolean;
  assistantDraft: string;
  assistantReviewId: string | null;
  approval: Approval | undefined;
  selectApproval: (id: string) => void;
  pendingAction: string | null;
  connected: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  connect: (url: string, code: string) => Promise<void>;
  disconnect: () => Promise<void>;
  decideApproval: (decision: 'approved' | 'rejected') => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  retryActivity: (id: string) => Promise<void>;
  completeOnboarding: () => void;
  replayOnboarding: () => void;
  setAssistantDraft: (value: string) => void;
  setAssistantReview: (id: string | null) => void;
  sendAssistantMessage: (value: string) => Promise<void>;
  stageListingChange: (id: string, changes: Partial<Pick<Property, 'name' | 'description' | 'checkInTime' | 'status' | 'automationEnabled'>>) => void;
}
const initial = (): HostSnapshot => JSON.parse(JSON.stringify({ properties, tasks: initialTasks, approvals: [initialApproval], activity: initialActivity, briefing: '', syncedAt: '', timeline: timelineEvents }));
const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<HostSnapshot>(initial);
  const [selectedApprovalId, selectApproval] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [assistantBusy, setAssistantBusy] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState('');
  const [assistantReviewId, setAssistantReview] = useState<string | null>(null);
  const api = useRef<HostApi | null>(null);
  const generation = useRef(0);
  const busy = useRef(false);
  const reading = useRef(false);
  const approval = data.approvals.find((item) => item.id === selectedApprovalId)
    ?? data.approvals.find((item) => item.status === 'pending') ?? data.approvals[0];
  const refresh = async () => {
    const client = api.current;
    if (!client || reading.current || busy.current) return;
    const version = generation.current;
    reading.current = true; setRefreshing(true);
    try {
      const snapshot = await client.snapshot();
      if (version === generation.current) { setData(snapshot); setError(null); }
    } catch (failure) {
      if (version === generation.current) setError(failure instanceof Error ? failure.message : 'Unable to refresh workspace.');
    } finally { reading.current = false; setRefreshing(false); }
  };
  useEffect(() => {
    const interval = setInterval(() => { void refresh(); }, 5000);
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void refresh(); });
    return () => { clearInterval(interval); subscription.remove(); generation.current++; };
  }, []);
  const connect = async (url: string, code: string) => {
    if (busy.current) return;
    busy.current = true;
    const version = ++generation.current;
    setPendingAction('connect'); setError(null);
    const client = new HostApi(url.replace(/\/$/, ''));
    try {
      await client.pair(code.trim().toLowerCase());
      const snapshot = await client.snapshot();
      if (version !== generation.current) { void client.disconnect(); return; }
      const previous = api.current;
      api.current = client; setData(snapshot); setConnected(true); selectApproval(null);
      if (previous) void previous.disconnect().catch(() => {});
    } catch (failure) {
      void client.disconnect().catch(() => {});
      setError(failure instanceof Error ? failure.message : 'Unable to connect.');
      throw failure;
    } finally { busy.current = false; setPendingAction(null); }
  };
  const disconnect = async () => {
    if (busy.current) return;
    generation.current++;
    const client = api.current;
    api.current = null; setConnected(false); setData(initial()); selectApproval(null); setError(null);
    if (client) try { await client.disconnect(); } catch { setError('Disconnected on this device. The offline server session expires automatically within eight hours.'); }
  };
  const mutate = async (key: string, remote: (client: HostApi) => Promise<void>, local: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    const version = ++generation.current;
    setPendingAction(key); setError(null);
    try {
      const client = api.current;
      if (client) {
        await remote(client);
        const snapshot = await client.snapshot();
        if (version === generation.current) setData(snapshot);
      } else await local();
    } catch (failure) {
      setError(`${failure instanceof Error ? failure.message : 'Action failed.'} Refresh to confirm the saved result before trying again.`);
    } finally { busy.current = false; setPendingAction(null); }
  };
  const decideApproval = async (decision: 'approved' | 'rejected') => {
    if (!approval || approval.status !== 'pending') return;
    const id = approval.id;
    selectApproval(id);
    if (approval.localOnly && connected) { setError('This preview change cannot be approved while your workspace is connected. Disconnect first, or start the listing change with VirtuHost.'); return; }
    await mutate(`approval:${decision}`, (client) => client.decideApproval(id, decision), async () => {
      await demoService.decideApproval(id, decision);
      setData((current) => ({ ...current,
        properties: decision === 'approved' && approval.localDraft ? current.properties.map((item) => {
          if (item.id !== approval.propertyId) return item;
          const nextStay = approval.localDraft?.checkInTime ? item.nextStay.replace(/\b([01]\d|2[0-3]):[0-5]\d\b/, approval.localDraft.checkInTime) : item.nextStay;
          return { ...item, ...approval.localDraft, nextStay, syncLabel: 'Approved in preview. Not published to a booking channel.' };
        }) : current.properties,
        approvals: current.approvals.map((item) => item.id === id ? { ...item, status: decision } : item),
        activity: [{ id: `decision-${Date.now()}`, kind: 'user', title: `Listing change ${decision}`, detail: 'Demo decision recorded. No live listing was changed.', time: 'Now' }, ...current.activity] }));
    });
  };
  const completeTask = async (id: string) => mutate(`task:${id}`, (client) => client.completeTask(id), async () => {
    await demoService.completeTask(id);
    setData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, status: 'completed', overdue: false } : task) }));
  });
  const retryActivity = async (id: string) => mutate(`activity:${id}`, (client) => client.retryActivity(id), async () => {
    await demoService.retryActivity(id);
    setData((current) => ({ ...current, activity: current.activity.map((item) => item.id === id ? { ...item, retried: true, retryable: false } : item) }));
  });
  const sendAssistantMessage = async (value: string) => {
    const prompt = value.trim();
    if (!prompt || assistantBusy) return;
    setAssistantDraft('');
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', text: prompt }]);
    setAssistantBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 520));
    const normalized = prompt.toLowerCase();
    let response: AssistantMessage = { id: `assistant-${Date.now()}`, role: 'assistant', text: 'I can help with listings, open tasks, reviews and proposed changes. This demo uses the same supported intent vocabulary as the WhatsApp assistant, but it is not connected to a live AI provider.' };
    if (normalized.includes('task') || normalized.includes('attention') || normalized.includes('today')) {
      const open = data.tasks.filter((task) => task.status === 'open'); const overdue = open.filter((task) => task.overdue); const retryable = data.activity.filter((item) => item.retryable && !item.retried);
      const parts = [open.length ? `${open.length} open task${open.length === 1 ? '' : 's'}` : 'no open tasks', overdue.length ? `${overdue.length} overdue` : 'none overdue', retryable.length ? `${retryable.length} safe sync retry waiting` : 'no sync retries waiting'];
      response = { ...response, text: `Right now you have ${parts.join(', ')}.`, action: { label: 'View tasks', route: '/tasks' } };
    } else if (normalized.includes('perform') || normalized.includes('listing')) {
      const summary = data.properties.map((property) => `${property.name} is ${property.status.toLowerCase()} with ${property.syncHealth.toLowerCase()} sync health`).join('. ');
      response = { ...response, text: `${summary}. This reflects the current workspace state.`, action: { label: 'Open listings', route: '/listings' } };
    } else if (normalized.includes('review') || normalized.includes('reply')) {
      const selected = reviews.find((item) => item.id === assistantReviewId) ?? reviews.find((item) => item.responseStatus === 'Needs reply') ?? reviews[0]; const listing = data.properties.find((item) => item.id === selected.propertyId);
      const draft = `Thank you, ${selected.reviewer}. We are so glad you enjoyed your stay at ${listing?.name ?? 'the property'} and appreciated the experience. It was a pleasure hosting you.`;
      response = { ...response, text: `Draft for ${selected.reviewer}: “${draft}” This is editable and has not been published.`, action: { label: 'Review guest feedback', route: '/reviews' } };
      setAssistantDraft(draft);
    }
    setMessages((current) => [...current, response]); setAssistantBusy(false);
  };
  const stageListingChange: AppStateValue['stageListingChange'] = (id, changes) => {
    const current = data.properties.find((item) => item.id === id);
    if (!current || connected) { setError(connected ? 'Manual preview edits are paused while your workspace is connected. Disconnect first, or ask VirtuHost to begin the listing change.' : 'Listing not found.'); return; }
    const fields = Object.entries(changes).filter(([key, value]) => value !== current[key as keyof Property]);
    if (!fields.length) return;
    const labels: Record<string, string> = { name: 'Listing name', description: 'Description', checkInTime: 'Check-in time', status: 'Listing status', automationEnabled: 'Automation' };
    const readable = (value: unknown) => typeof value === 'boolean' ? (value ? 'Active' : 'Paused') : String(value);
    const changeDetails = fields.map(([key, value]) => ({ field: labels[key] ?? key, before: readable(current[key as keyof Property]), after: readable(value) }));
    const summary = changeDetails.map((item) => item.field.toLowerCase()).join(', ');
    const proposal: Approval = { id: `manual-${Date.now()}`, propertyId: id, field: `Manual edit: ${summary}`, before: changeDetails.map((item) => `${item.field}: ${item.before}`).join('\n'), after: changeDetails.map((item) => `${item.field}: ${item.after}`).join('\n'), changes: changeDetails, localDraft: changes, localOnly: true, requestedBy: 'Mobile app', expires: 'Today at 23:59', status: 'pending', kind: 'listing_text' };
    setData((snapshot) => ({ ...snapshot,
      approvals: [proposal, ...snapshot.approvals],
      activity: [{ id: `manual-activity-${Date.now()}`, kind: 'user', title: 'Listing changes staged', detail: `${current.name}: ${summary}. Saved locally, not published.`, time: 'Now' }, ...snapshot.activity],
    })); selectApproval(proposal.id);
  };
  return <AppStateContext.Provider value={{ ...data, approval, selectApproval, pendingAction, connected, error, refreshing, refresh, connect, disconnect, decideApproval, completeTask, retryActivity, onboardingComplete, reviews, messages, assistantBusy, assistantDraft, assistantReviewId, completeOnboarding: () => setOnboardingComplete(true), replayOnboarding: () => setOnboardingComplete(false), setAssistantDraft, setAssistantReview, sendAssistantMessage, stageListingChange }}>{children}</AppStateContext.Provider>;
}
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside AppStateProvider');
  return context;
}
