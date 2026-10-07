"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { toast } from "sonner";

type Connection = { id: string; provider: string; accountEmail: string; scopeLevel: string; isActive: boolean; lastSyncedAt: string | null; lastSyncError: string | null };
const CALLBACK_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  connected: { tone: "success", text: "Google Calendar connected." },
  error: { tone: "error", text: "Connection failed — ask an admin to check the server logs for [google-calendar-callback]." },
  "state-mismatch": { tone: "error", text: "Sign-in verification failed (state mismatch). Please try connecting again." },
  "no-refresh-token": { tone: "error", text: "Google did not return a refresh token. Remove this app's access at myaccount.google.com/permissions, then connect again." },
};

export function CalendarConnectionsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackResult = searchParams.get("calendar");
  const banner = callbackResult ? CALLBACK_MESSAGES[callbackResult] ?? null : null;
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/calendar-connections");
      if (!response.ok) throw new Error(`Failed to load connections (${response.status})`);
      setConnections((await response.json()).connections); setError(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to load connections"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!callbackResult) return;
    const message = CALLBACK_MESSAGES[callbackResult];
    if (message) { if (message.tone === "success") toast.success(message.text); else toast.error(message.text); }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("calendar");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [callbackResult, pathname, router, searchParams]);
  async function disconnect(id: string) {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/profile/calendar-connections/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(`Disconnect failed (${response.status})`);
      toast.success("Calendar connection removed successfully."); await load();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Disconnect failed";
      toast.error(message); setError(message);
    } finally { setDeletingId(null); }
  }
  // A two-way connection must retain readwrite scope when reconnecting.
  const connectLevel = connections.some((connection) => connection.scopeLevel === "readwrite") ? "readwrite" : "readonly";

  return <Paper variant="outlined" sx={{ p: 3 }}>
    <Stack spacing={2}>
      {banner && <Alert severity={banner.tone}>{banner.text}</Alert>}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Calendar connections</Typography>
        <Button component="a" href={`/api/profile/calendar-connections/google/authorize?level=${connectLevel}`} variant="contained">Connect Google Calendar</Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Typography color="text.secondary">Loading…</Typography> : !connections.length ? <Typography color="text.secondary">No calendars connected.</Typography> :
        <Stack spacing={1}>{connections.map((connection) => <Paper key={connection.id} variant="outlined" sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}>
            <Box><Typography sx={{ fontWeight: 600 }}>{connection.accountEmail}</Typography>
              <Typography variant="body2" color="text.secondary">
                {connection.scopeLevel === "readwrite" ? "Two-way · " : "Inbound only · "}
                {connection.isActive ? connection.lastSyncedAt ? `Synced ${new Date(connection.lastSyncedAt).toLocaleString()}` : "Waiting for first sync" : `Needs reconnect${connection.lastSyncError ? `: ${connection.lastSyncError}` : ""}`}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              <Chip size="small" color={connection.isActive ? "success" : "warning"} label={connection.isActive ? "Active" : "Needs reconnect"} />
              {connection.isActive && connection.scopeLevel !== "readwrite" && <Button component="a" href="/api/profile/calendar-connections/google/authorize?level=readwrite" size="small" variant="outlined">Enable two-way sync</Button>}
              {!connection.isActive && <Button component="a" href={`/api/profile/calendar-connections/google/authorize?level=${connection.scopeLevel === "readwrite" ? "readwrite" : "readonly"}`} size="small" variant="outlined">Reconnect</Button>}
              <Button size="small" color="error" onClick={() => void disconnect(connection.id)} disabled={deletingId !== null}>{deletingId === connection.id ? "Disconnecting..." : "Disconnect"}</Button>
            </Stack>
          </Stack>
        </Paper>)}</Stack>}
    </Stack>
  </Paper>;
}
