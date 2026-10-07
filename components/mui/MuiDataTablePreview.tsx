"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon, CircleIcon, Cross2Icon, MixerHorizontalIcon, PlusCircledIcon, QuestionMarkCircledIcon, StopwatchIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, PanelTopClose, PanelTopOpen } from "lucide-react";

type Status = "Active" | "Pending" | "Inactive" | "Closed";
type SortKey = "name" | "owner" | "status" | "budget";
type OptionalColumn = "owner" | "account" | "name" | "budget" | "status";
type SampleOpportunity = {
  id: number;
  closeDate: string;
  name: string;
  owner: string;
  account: string;
  status: Status;
  budget: number;
  nextStep: string;
};

const sampleOpportunities: SampleOpportunity[] = [
  { id: 1, closeDate: "26-10-31", name: "Northstar expansion", owner: "Alex Morgan", account: "Northstar Studio", status: "Active", budget: 42500, nextStep: "Proposal review" },
  { id: 2, closeDate: "26-11-04", name: "Olive & Oak renewal", owner: "Jordan Lee", account: "Olive & Oak", status: "Pending", budget: 18250, nextStep: "Schedule call" },
  { id: 3, closeDate: "26-11-08", name: "Good Company rollout", owner: "Sam Rivera", account: "The Good Company", status: "Active", budget: 9800, nextStep: "Send contract" },
  { id: 4, closeDate: "26-10-18", name: "Beacon partnership", owner: "Alex Morgan", account: "Beacon Works", status: "Closed", budget: 31000, nextStep: "—" },
  { id: 5, closeDate: "26-11-12", name: "Summit onboarding", owner: "Jordan Lee", account: "Summit Group", status: "Active", budget: 15750, nextStep: "Confirm scope" },
  { id: 6, closeDate: "26-11-15", name: "Harbor account", owner: "Sam Rivera", account: "Harbor Co.", status: "Inactive", budget: 7200, nextStep: "—" },
  { id: 7, closeDate: "26-11-20", name: "Cedar Grove phase 2", owner: "Alex Morgan", account: "Cedar Grove", status: "Pending", budget: 26400, nextStep: "Draft quote" },
  { id: 8, closeDate: "26-11-22", name: "Atlas service plan", owner: "Jordan Lee", account: "Atlas", status: "Active", budget: 13400, nextStep: "Review terms" },
  { id: 9, closeDate: "26-11-26", name: "Meridian pilot", owner: "Sam Rivera", account: "Meridian", status: "Pending", budget: 11900, nextStep: "Book demo" },
  { id: 10, closeDate: "26-10-21", name: "Lumen migration", owner: "Alex Morgan", account: "Lumen", status: "Closed", budget: 47800, nextStep: "—" },
  { id: 11, closeDate: "26-12-02", name: "Willow support", owner: "Jordan Lee", account: "Willow", status: "Active", budget: 8300, nextStep: "Send estimate" },
  { id: 12, closeDate: "26-12-05", name: "Bridgewater launch", owner: "Sam Rivera", account: "Bridgewater", status: "Pending", budget: 22500, nextStep: "Proposal review" },
];

const statuses: Status[] = ["Active", "Inactive", "Pending", "Closed"];
const statusIcons = {
  Active: QuestionMarkCircledIcon,
  Inactive: CircleIcon,
  Pending: CircleIcon,
  Closed: StopwatchIcon,
};
const columnLabels: Record<OptionalColumn, string> = {
  owner: "Assigned to",
  account: "Assigned account",
  name: "Name",
  status: "Status",
  budget: "Budget",
};
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const outlineButtonSx = {
  height: 32,
  borderRadius: "calc(var(--radius) - 2px)",
  borderColor: "divider",
  color: "text.primary",
  fontSize: 14,
  "&:hover": { borderColor: "divider", bgcolor: "secondary.main" },
};

export function MuiDataTablePreview() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [visible, setVisible] = useState<Record<OptionalColumn, boolean>>({
    owner: true,
    account: true,
    name: true,
    status: true,
    budget: true,
  });
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [rowAnchor, setRowAnchor] = useState<HTMLElement | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [sortColumn, setSortColumn] = useState<SortKey | null>(null);
  const [notice, setNotice] = useState(false);
  const [hide, setHide] = useState(false);

  const records = useMemo(() => {
    const filtered = sampleOpportunities.filter(
      (record) =>
        record.name.toLowerCase().includes(search.trim().toLowerCase()) &&
        (selectedStatuses.length === 0 || selectedStatuses.includes(record.status)),
    );
    return filtered.sort((a, b) => {
      const comparison = sortKey === "budget"
        ? a.budget - b.budget
        : a[sortKey].localeCompare(b[sortKey]);
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [search, selectedStatuses, sortKey, sortDirection]);

  const toggleStatus = (status: Status) => {
    setSelectedStatuses((current) =>
      current.includes(status) ? current.filter((item) => item !== status) : [...current, status],
    );
    setPage(0);
  };

  const sortHeader = (key: SortKey, title: string) => (
    <Button
      variant="text"
      onClick={(event) => { setSortColumn(key); setSortAnchor(event.currentTarget); }}
      sx={{ minWidth: 0, height: 32, ml: -1.5, px: 1.5, color: "text.secondary", fontSize: 14, fontWeight: 500, textTransform: "none", "&:hover": { bgcolor: "secondary.main" } }}
    >
      {title}
      {sortKey === key && sortDirection === "desc" ? <ArrowDownIcon style={{ marginLeft: 8 }} /> : sortKey === key && sortDirection === "asc" ? <ArrowUpIcon style={{ marginLeft: 8 }} /> : <CaretSortIcon style={{ marginLeft: 8 }} />}
    </Button>
  );

  const visibleColumnCount = 3 + Object.values(visible).filter(Boolean).length;
  const pageCount = Math.max(1, Math.ceil(records.length / rowsPerPage));

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      }}
    >
      <Box sx={{ p: 3, pb: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>Opportunities</Typography>
          <Button variant="contained" aria-label="Add opportunity preview" onClick={() => setNotice(true)} sx={{ minWidth: 36, my: 1 }}>+</Button>
        </Stack>
        <Divider sx={{ mt: 2.5 }} />
      </Box>
      <Box sx={{ px: 3, pb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <IconButton size="small" aria-label={hide ? "Show table content" : "Hide table content"} onClick={() => setHide(!hide)} sx={{ color: "text.secondary" }}>
            {hide ? <PanelTopOpen size={18} /> : <PanelTopClose size={18} />}
          </IconButton>
        </Box>
        {hide ? (
          <Typography variant="body2">This content is hidden now. Use the icon above to show content.</Typography>
        ) : (
        <>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
          <TextField
            size="small"
            placeholder="Filter opportunities..."
            aria-label="Filter opportunities"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            sx={{
              width: { xs: "100%", md: 250 },
              "& .MuiInputBase-root": { height: 32, borderRadius: "calc(var(--radius) - 2px)" },
              "& .MuiInputBase-input": { fontSize: 14 },
            }}
          />
          <Button
            variant="outlined"
            onClick={(event) => setStatusAnchor(event.currentTarget)}
            startIcon={<PlusCircledIcon />}
            sx={{ ...outlineButtonSx, borderStyle: "dashed", whiteSpace: "nowrap" }}
          >
            Status{selectedStatuses.length ? ` · ${selectedStatuses.length} selected` : ""}
          </Button>
          {(search || selectedStatuses.length > 0) && (
            <Button onClick={() => { setSearch(""); setSelectedStatuses([]); setPage(0); }} endIcon={<Cross2Icon />} sx={{ height: 32, color: "text.primary" }}>Reset</Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" startIcon={<MixerHorizontalIcon />} onClick={(event) => setViewAnchor(event.currentTarget)} sx={outlineButtonSx}>
            View
          </Button>
        </Stack>

      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        <MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("asc"); } setSortAnchor(null); }}><ArrowUpIcon style={{ marginRight: 12 }} />Asc</MenuItem>
        <MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("desc"); } setSortAnchor(null); }}><ArrowDownIcon style={{ marginRight: 12 }} />Desc</MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (sortColumn) setVisible((current) => ({ ...current, [sortColumn]: false })); setSortAnchor(null); }}>Hide</MenuItem>
      </Menu>

      <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>
        {statuses.map((status) => (
          <MenuItem key={status} onClick={() => toggleStatus(status)}>
            <Checkbox size="small" checked={selectedStatuses.includes(status)} sx={{ p: 0.5, mr: 1 }} />
            {status}
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>
        <MenuItem disabled>Toggle columns</MenuItem>
        <Divider />
        {(Object.keys(columnLabels) as OptionalColumn[]).map((column) => (
          <MenuItem key={column} onClick={() => setVisible((current) => ({ ...current, [column]: !current[column] }))}>
            <Checkbox size="small" checked={visible[column]} sx={{ p: 0.5, mr: 1 }} />
            {columnLabels[column]}
          </MenuItem>
        ))}
      </Menu>

      <TableContainer sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: "calc(var(--radius) - 2px)" }}>
        <Table
          sx={{
            minWidth: 1120,
            fontSize: 14,
            "& .MuiTableCell-head": { height: 48, px: 2, py: 0, fontSize: 14, fontWeight: 500, color: "text.secondary", borderBottom: 0 },
            "& .MuiTableCell-body": { p: 2, fontSize: 14, borderBottom: 0 },
            "& .MuiTableRow-root": { borderBottom: 1, borderColor: "divider" },
            "& .MuiTableBody-root .MuiTableRow-root:last-child": { borderBottom: 0 },
            "& .MuiTableRow-hover:hover": { bgcolor: theme.alpha(theme.palette.secondary.main, 0.5) },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Expected close</TableCell>
              {visible.owner && <TableCell>{sortHeader("owner", "Assigned to")}</TableCell>}
              {visible.account && <TableCell>Assigned account</TableCell>}
              {visible.name && <TableCell>{sortHeader("name", "Name")}</TableCell>}
              {visible.budget && <TableCell>{sortHeader("budget", "Budget")}</TableCell>}
              <TableCell>Next step</TableCell>
              {visible.status && <TableCell>{sortHeader("status", "Status")}</TableCell>}
              <TableCell aria-label="Actions" />
            </TableRow>
          </TableHead>
          <TableBody>
            {records.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((record) => (
              <TableRow key={record.id} hover>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{record.closeDate}</TableCell>
                {visible.owner && <TableCell>{record.owner}</TableCell>}
                {visible.account && <TableCell>{record.account}</TableCell>}
                {visible.name && (
                  <TableCell>
                    <Button
                      variant="text"
                      onClick={() => setNotice(true)}
                      sx={{ p: 0, minWidth: 0, textAlign: "left", color: "text.primary", fontSize: 14, fontWeight: 400, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}
                    >
                      {record.name}
                    </Button>
                  </TableCell>
                )}
                {visible.budget && <TableCell>{money.format(record.budget)}</TableCell>}
                <TableCell>{record.nextStep}</TableCell>
                {visible.status && (
                  <TableCell>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                      {(() => { const Icon = statusIcons[record.status]; return <Icon width={16} height={16} color={theme.palette.text.secondary} aria-hidden="true" />; })()}
                      <span>{record.status}</span>
                    </Stack>
                  </TableCell>
                )}
                <TableCell>
                  <IconButton size="small" aria-label={`Actions for ${record.name}`} onClick={(event) => setRowAnchor(event.currentTarget)} sx={{ width: 32, height: 32, color: "text.secondary" }}>
                    <MoreHorizontal size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} align="center" sx={{ py: 5 }}>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={rowAnchor} open={Boolean(rowAnchor)} onClose={() => setRowAnchor(null)}>
        {["View", "Update"].map((action) => <MenuItem key={action} onClick={() => { setRowAnchor(null); setNotice(true); }}>{action}</MenuItem>)}
        <Divider />
        <MenuItem onClick={() => { setRowAnchor(null); setNotice(true); }}>Delete</MenuItem>
      </Menu>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, mt: 2, gap: 2, flexWrap: "wrap" }}>
        <Typography variant="body2" color="text.secondary">0 of {records.length} row(s) selected.</Typography>
        <Stack direction="row" spacing={{ xs: 1, lg: 3 }} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>Rows per page</Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
              sx={{ height: 32, width: 70, fontSize: 14, borderRadius: "calc(var(--radius) - 2px)" }}
            >
              {[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}
            </Select>
          </Stack>
          <Typography variant="body2" sx={{ width: 100, textAlign: "center", fontWeight: 500 }}>Page {page + 1} of {pageCount}</Typography>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="Go to first page" disabled={page === 0} onClick={() => setPage(0)} sx={{ ...outlineButtonSx, width: 32, border: 1, display: { xs: "none", lg: "inline-flex" } }}><ChevronsLeft size={16} /></IconButton>
            <IconButton aria-label="Go to previous page" disabled={page === 0} onClick={() => setPage(page - 1)} sx={{ ...outlineButtonSx, width: 32, border: 1 }}><ChevronLeft size={16} /></IconButton>
            <IconButton aria-label="Go to next page" disabled={page >= pageCount - 1} onClick={() => setPage(page + 1)} sx={{ ...outlineButtonSx, width: 32, border: 1 }}><ChevronRight size={16} /></IconButton>
            <IconButton aria-label="Go to last page" disabled={page >= pageCount - 1} onClick={() => setPage(pageCount - 1)} sx={{ ...outlineButtonSx, width: 32, border: 1, display: { xs: "none", lg: "inline-flex" } }}><ChevronsRight size={16} /></IconButton>
          </Stack>
        </Stack>
      </Box>
        </>
        )}
      </Box>
      <Snackbar
        open={notice}
        autoHideDuration={2600}
        onClose={() => setNotice(false)}
        message="Preview only. No CRM record was changed."
      />
    </Paper>
  );
}
