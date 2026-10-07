"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Inbox, PenBox, Search, Send, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Divider, IconButton, InputAdornment, Paper, Stack, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import { AccountSwitcher } from "./account-switcher";
import { ComposeModal } from "./ComposeModal";
import { MailDisplay } from "./mail-display";
import { MailList } from "./mail-list";
import { Nav } from "./nav";
import type { ConnectedAccount, Mail } from "../data";
import { useMail } from "../use-mail";

interface MailProps {
  accounts: ConnectedAccount[];
  mails: Mail[];
  activeAccountId: string | null;
  activeFolder: "INBOX" | "SENT";
  page: number;
  totalPages: number;
  defaultLayout: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize: number;
}

export function MailComponent({ accounts, mails, activeAccountId, activeFolder, page, totalPages, defaultLayout = [20, 35, 45], defaultCollapsed = false, navCollapsedSize }: MailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mail] = useMail();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sizes, setSizes] = useState<[number, number]>([defaultLayout[0], defaultLayout[1]]);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const left = isCollapsed ? navCollapsedSize : sizes[0];
  const middle = sizes[1];
  const right = Math.max(30, 100 - left - middle);

  useEffect(() => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify([left, middle, 100 - left - middle])}`;
    document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(isCollapsed)}`;
  }, [left, middle, isCollapsed]);

  function folderHref(folder: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("folder", folder);
    params.delete("page");
    return `?${params.toString()}`;
  }
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set("search", search.trim()); else params.delete("search");
    params.delete("page");
    router.push(`?${params.toString()}`);
  };
  const startResize = (which: "nav" | "list", event: ReactPointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    event.preventDefault();
    const width = containerRef.current.getBoundingClientRect().width;
    const startX = event.clientX;
    const startLeft = left;
    const startMiddle = middle;
    const move = (pointer: PointerEvent) => {
      const change = (pointer.clientX - startX) / width * 100;
      if (which === "nav") {
        const proposed = startLeft + change;
        if (proposed <= navCollapsedSize + 2) setIsCollapsed(true);
        else { setIsCollapsed(false); setSizes((current) => [Math.min(20, Math.max(18, proposed)), current[1]]); }
      } else {
        setSizes((current) => [current[0], Math.min(100 - (isCollapsed ? navCollapsedSize : current[0]) - 30, Math.max(30, startMiddle + change))]);
      }
    };
    const stop = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", stop); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  };
  const toggleCollapsed = () => setIsCollapsed((value) => !value);
  const splitter = (label: string, which: "nav" | "list") => <Box role="separator" aria-label={label} aria-orientation="vertical" tabIndex={0} onPointerDown={(event) => startResize(which, event)} onKeyDown={(event) => { if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); const delta = event.key === "ArrowRight" ? 1 : -1; if (which === "nav") { if (isCollapsed && delta > 0) setIsCollapsed(false); else if (!isCollapsed) setSizes((current) => [Math.max(18, Math.min(20, current[0] + delta)), current[1]]); } else setSizes((current) => [current[0], Math.max(30, Math.min(100 - left - 30, current[1] + delta))]); } }} sx={{ display: { xs: "none", md: "block" }, cursor: "col-resize", bgcolor: "divider", "&:hover": { bgcolor: "primary.main" } }} />;

  return <Paper ref={containerRef} variant="outlined" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: `minmax(0, ${left}fr) 4px minmax(0, ${middle}fr) 4px minmax(0, ${right}fr)` }, height: { xs: "auto", md: "min(75vh, 900px)" }, minHeight: { md: 560 }, borderRadius: "var(--radius)", overflow: "hidden" }}>
    <Box sx={{ minWidth: 0, borderRight: { xs: 0, md: 1 }, borderBottom: { xs: 1, md: 0 }, borderColor: "divider" }}>
      <Stack direction="row" sx={{ p: 1, alignItems: "center", gap: 0.5 }}><Box sx={{ flex: 1, minWidth: 0 }}><AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} activeAccountId={activeAccountId} /></Box><Tooltip title={isCollapsed ? "Expand folders" : "Collapse folders"}><IconButton aria-label={isCollapsed ? "Expand folders" : "Collapse folders"} size="small" onClick={toggleCollapsed}>{isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</IconButton></Tooltip></Stack>
      <Divider />
      {activeAccountId && <Box sx={{ p: 1, display: "flex", justifyContent: isCollapsed ? "center" : "stretch" }}><ComposeModal accountId={activeAccountId} trigger={isCollapsed ? <IconButton aria-label="Compose" title="Compose" color="primary"><PenBox size={18} /></IconButton> : undefined} /></Box>}
      <Nav isCollapsed={isCollapsed} links={[{ title: "Inbox", icon: Inbox, variant: activeFolder === "INBOX" ? "default" : "ghost", href: folderHref("INBOX") }, { title: "Sent", icon: Send, variant: activeFolder === "SENT" ? "default" : "ghost", href: folderHref("SENT") }]} />
    </Box>
    {splitter("Resize folders", "nav")}
    <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: { xs: 350, md: 0 }, borderRight: { xs: 0, md: 1 }, borderBottom: { xs: 1, md: 0 }, borderColor: "divider" }}>
      <Stack direction="row" sx={{ px: 2, pt: 1, alignItems: "center", justifyContent: "space-between" }}><Typography variant="h6" component="h2">{activeFolder === "SENT" ? "Sent" : "Inbox"}</Typography><Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="Mail filter"><Tab label="All mail" /><Tab label="Unread" /></Tabs></Stack>
      <Divider />
      <Box component="form" onSubmit={submitSearch} sx={{ p: 2 }}><TextField size="small" fullWidth placeholder="Search" aria-label="Search mail" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }} /></Box>
      <Box sx={{ flex: 1, minHeight: 0 }}><MailList items={tab === 0 ? mails : mails.filter((item) => !item.isRead)} page={page} totalPages={totalPages} /></Box>
    </Box>
    {splitter("Resize message list", "list")}
    <Box sx={{ minWidth: 0, minHeight: { xs: 400, md: 0 } }}><MailDisplay mail={mails.find((item) => item.id === mail.selected) || null} activeAccountId={activeAccountId} /></Box>
  </Paper>;
}
