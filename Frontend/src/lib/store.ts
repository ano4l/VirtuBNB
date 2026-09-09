import { useCallback, useEffect, useState } from "react";
import { api, clearSession, type Snapshot } from "./api";

export const localSnapshot: Snapshot = {
  mode: "demo-data",
  syncedAt: new Date().toISOString(),
  dashboard: { briefing: "Demo portfolio: two arrivals and one checkout. Everything is ready.", whatsappConnected: false, arrivals: 2, departures: 1, openTasks: 2, pendingApprovals: 1 },
  properties: [
    { id: "prop_sandton", name: "Sandton City Apartment", channel: "Airbnb", status: "occupied", nextStay: "Sarah Mitchell · 12 Sep", syncStatus: "healthy" },
    { id: "prop_rosebank", name: "Rosebank Designer Loft", channel: "Airbnb", status: "turnover", nextStay: "Michael Chen · today", syncStatus: "healthy" },
  ],
  tasks: [{ id: "task-clean", propertyId: "prop_rosebank", title: "Confirm cleaning handover", dueLabel: "Due 11:30", assignee: "Lerato", status: "open" }, { id: "task-checkin", propertyId: "prop_sandton", title: "Send tomorrow's check-in details", dueLabel: "Due today", assignee: "Virtu", status: "open" }],
  approvals: [{ id: "approval_checkin", code: "VH-EARLY", propertyId: "prop_sandton", kind: "listing_text", field: "Check-in time", before: "15:00", after: "13:00", requestedBy: "mobile", status: "pending", createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString() }],
  activities: [{ id: "activity_booking", type: "automation", title: "Check-in instructions sent to Sarah Mitchell", detail: "Sandton City Apartment · demo preview", occurredAt: new Date().toISOString() }, { id: "activity_sync", type: "sync", title: "Weekend pricing updated", detail: "Sandton City Apartment · host approved", occurredAt: new Date(Date.now() - 3600000).toISOString() }, { id: "activity_failure", type: "failure", title: "Listing sync needs attention", detail: "Demo provider did not confirm this action.", occurredAt: new Date(Date.now() - 7200000).toISOString(), retryable: true }],
};

export function useHostStore() {
  const [snapshot, setSnapshot] = useState<Snapshot>(localSnapshot);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try { setSnapshot(await api.snapshot()); setOffline(false); } catch (caught) { setOffline(true); setError(caught instanceof Error ? caught.message : "Virtu is offline"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const mutate = useCallback(async (operation: () => Promise<unknown>) => { try { await operation(); await refresh(); return true; } catch (caught) { setError(caught instanceof Error ? caught.message : "Action could not be confirmed"); return false; } }, [refresh]);
  const signOut = useCallback(async () => { try { await api.revoke(); } catch { /* expired sessions are still safe to clear */ } clearSession(); }, []);
  return { snapshot, loading, offline, error, refresh, mutate, signOut };
}
