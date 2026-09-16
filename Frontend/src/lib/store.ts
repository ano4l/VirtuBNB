import { useCallback, useEffect, useState } from "react";
import { api, clearSession, type Snapshot } from "./api";

export const localSnapshot: Snapshot = {
  mode: "setup-required",
  syncedAt: new Date().toISOString(),
  dashboard: { briefing: "Connect the control-plane API and sign in to load your workspace.", whatsappConnected: false, arrivals: 0, departures: 0, openTasks: 0, pendingApprovals: 0 },
  properties: [],
  tasks: [],
  approvals: [],
  activities: [],
  bookings: [],
  conversations: [],
  listings: [],
  calendar: [],
  insights: [],
  previewActions: [],
  agentCommands: [],
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
