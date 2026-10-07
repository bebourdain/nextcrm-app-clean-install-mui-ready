"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import moment from "moment";
import { Decimal } from "@prisma/client/runtime/client";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  CircleIcon,
  Cross2Icon,
  MixerHorizontalIcon,
  PlusCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  PanelTopClose,
  PanelTopOpen,
  X,
} from "lucide-react";

import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import type { getOpportunitiesFull } from "@/actions/crm/get-opportunities-with-includes";
import { deleteOpportunity } from "@/actions/crm/opportunities/delete-opportunity";
import { useCurrency } from "@/context/currency-context";
import { convertAmount, formatCurrency, type Rate } from "@/lib/currency-format";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { NewOpportunityForm } from "./NewOpportunityForm";
import { UpdateOpportunityForm } from "./UpdateOpportunityForm";
import { statuses } from "../table-data/data";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;
type OpportunityRecord = Awaited<ReturnType<typeof getOpportunitiesFull>>[number];
type SortKey = "owner" | "name" | "budget" | "status";
type OptionalColumn = "owner" | "account" | "name" | "budget" | "status";

const columnLabels: Record<OptionalColumn, string> = {
  owner: "Assigned to",
  account: "Assigned account",
  name: "Name",
  budget: "Budget",
  status: "Status",
};

const compactOutline = {
  height: 32,
  borderRadius: "calc(var(--radius) - 2px)",
  borderColor: "divider",
  color: "text.primary",
  fontSize: 14,
  "&:hover": { borderColor: "divider", bgcolor: "secondary.main" },
};

function budgetLabel(record: OpportunityRecord, displayCurrency: string, rates: Rate[]) {
  if (!record.budget) return "—";
  const fromCurrency = record.currency || "EUR";
  const amount = new Decimal(String(record.budget));
  if (displayCurrency !== fromCurrency && rates.length) {
    const converted = convertAmount(amount, fromCurrency, displayCurrency, rates);
    if (converted) return formatCurrency(converted, displayCurrency);
  }
  return formatCurrency(amount, fromCurrency);
}

export function MuiOpportunitiesPage({
  data,
  crmData,
  embedded = false,
  accountId,
}: {
  data: OpportunityRecord[];
  crmData: CrmData;
  embedded?: boolean;
  accountId?: string;
}) {
  const router = useRouter();
  const theme = useTheme();
  const t = useTranslations("CrmPage");
  const { displayCurrency } = useCurrency();
  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [visible, setVisible] = useState<Record<OptionalColumn, boolean>>({
    owner: true,
    account: true,
    name: true,
    budget: true,
    status: true,
  });
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortColumn, setSortColumn] = useState<SortKey | null>(null);
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [viewAnchor, setViewAnchor] = useState<HTMLElement | null>(null);
  const [rowAnchor, setRowAnchor] = useState<HTMLElement | null>(null);
  const [actionRow, setActionRow] = useState<OpportunityRecord | null>(null);
  const [updateRow, setUpdateRow] = useState<OpportunityRecord | null>(null);
  const [deleteRow, setDeleteRow] = useState<OpportunityRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hide, setHide] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rates = useMemo<Rate[]>(
    () => crmData.exchangeRates.map((rate) => ({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: new Decimal(String(rate.rate)),
    })),
    [crmData.exchangeRates],
  );

  const records = useMemo(() => {
    const result = data.filter((record) =>
      (record.name || "").toLowerCase().includes(search.trim().toLowerCase()) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(record.status || "")),
    );
    if (!sortKey) return result;
    return result.sort((left, right) => {
      let comparison = 0;
      if (sortKey === "budget") comparison = Number(left.budget || 0) - Number(right.budget || 0);
      if (sortKey === "name") comparison = (left.name || "").localeCompare(right.name || "");
      if (sortKey === "owner") comparison = (left.assigned_to_user?.name || "").localeCompare(right.assigned_to_user?.name || "");
      if (sortKey === "status") comparison = (left.status || "").localeCompare(right.status || "");
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, search, selectedStatuses, sortKey, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(records.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);
  const visibleColumnCount = 3 + Object.values(visible).filter(Boolean).length;

  const sortHeader = (key: SortKey, title: string) => (
    <Button
      variant="text"
      onClick={(event) => { setSortColumn(key); setSortAnchor(event.currentTarget); }}
      sx={{ minWidth: 0, height: 32, ml: -1.5, px: 1.5, color: "text.secondary", fontSize: 14, fontWeight: 500, "&:hover": { bgcolor: "secondary.main" } }}
    >
      {title}
      {sortKey === key && sortDirection === "asc" ? <ArrowUpIcon style={{ marginLeft: 8 }} /> :
        sortKey === key && sortDirection === "desc" ? <ArrowDownIcon style={{ marginLeft: 8 }} /> :
          <CaretSortIcon style={{ marginLeft: 8 }} />}
    </Button>
  );

  const closeRowMenu = () => { setRowAnchor(null); setActionRow(null); };
  const closeCreate = () => { setCreateOpen(false); router.refresh(); };
  const closeUpdate = () => { setUpdateRow(null); router.refresh(); };

  const confirmDelete = async () => {
    if (!deleteRow) return;
    setDeleting(true);
    try {
      const result = await deleteOpportunity(deleteRow.id);
      if (result.error) toast.error(result.error);
      else { toast.success("Opportunity has been deleted"); router.refresh(); }
    } catch {
      toast.error("Something went wrong while deleting opportunity. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteRow(null);
    }
  };

  return (
    <Box sx={{ width: "100%", pb: embedded ? 0 : 6 }}>
      {!embedded && <><MuiPageHeader title={t("opportunities.pageTitle")} description={t("opportunities.pageDescription")} /><Divider sx={{ my: 2 }} /></>}

      <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
        <Box sx={{ p: 3, pb: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>{embedded ? <Link href="/crm/opportunities" style={{ color: "inherit", textDecoration: "none" }}>{t("opportunities.viewTitle")}</Link> : t("opportunities.viewTitle")}</Typography>
            <Button variant="contained" aria-label={t("opportunities.addNew")} data-testid={embedded ? "add-opportunity-btn" : undefined} onClick={() => setCreateOpen(true)} sx={{ minWidth: 36, my: 1 }}>+</Button>
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
          ) : data.length === 0 ? (
            <Typography variant="body2">{t("opportunities.empty")}</Typography>
          ) : (
            <>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: { md: "center" } }}>
                <TextField
                  size="small"
                  placeholder="Filter opportunities..."
                  aria-label="Filter opportunities"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(0); }}
                  sx={{ width: { xs: "100%", md: 250 }, "& .MuiInputBase-root": { height: 32, borderRadius: "calc(var(--radius) - 2px)" }, "& .MuiInputBase-input": { fontSize: 14 } }}
                />
                {visible.status && (
                  <Button variant="outlined" startIcon={<PlusCircledIcon />} onClick={(event) => setStatusAnchor(event.currentTarget)} sx={{ ...compactOutline, borderStyle: "dashed", whiteSpace: "nowrap" }}>
                    Status{selectedStatuses.length ? " · " + selectedStatuses.length + " selected" : ""}
                  </Button>
                )}
                {(search || selectedStatuses.length > 0) && (
                  <Button onClick={() => { setSearch(""); setSelectedStatuses([]); setPage(0); }} endIcon={<Cross2Icon />} sx={{ height: 32, color: "text.primary" }}>Reset</Button>
                )}
                <Box sx={{ flex: 1 }} />
                <Button variant="outlined" startIcon={<MixerHorizontalIcon />} onClick={(event) => setViewAnchor(event.currentTarget)} sx={compactOutline}>View</Button>
              </Stack>

              <TableContainer sx={{ mt: 2, border: 1, borderColor: "divider", borderRadius: "calc(var(--radius) - 2px)" }}>
                <Table data-testid="opportunities-table" sx={{
                  minWidth: 1120,
                  "& .MuiTableCell-head": { height: 48, px: 2, py: 0, fontSize: 14, fontWeight: 500, color: "text.secondary", borderBottom: 0 },
                  "& .MuiTableCell-body": { p: 2, fontSize: 14, borderBottom: 0 },
                  "& .MuiTableRow-root": { borderBottom: 1, borderColor: "divider" },
                  "& .MuiTableBody-root .MuiTableRow-root:last-child": { borderBottom: 0 },
                  "& .MuiTableRow-hover:hover": { bgcolor: theme.alpha(theme.palette.secondary.main, 0.5) },
                }}>
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
                    {records.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((record) => {
                      const status = statuses.find((item) => item.value === record.status);
                      return (
                        <TableRow key={record.id} hover>
                          <TableCell sx={{ whiteSpace: "nowrap" }}>{record.close_date ? moment(record.close_date).format("YY-MM-DD") : "—"}</TableCell>
                          {visible.owner && <TableCell>{record.assigned_to_user?.name || "Unassigned"}</TableCell>}
                          {visible.account && <TableCell>{record.assigned_account?.name || "Unassigned"}</TableCell>}
                          {visible.name && <TableCell><Button component={Link} href={"/crm/opportunities/" + record.id} variant="text" sx={{ p: 0, minWidth: 0, textAlign: "left", color: "text.primary", fontSize: 14, fontWeight: 400, "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>{record.name}</Button></TableCell>}
                          {visible.budget && <TableCell>{budgetLabel(record, displayCurrency, rates)}</TableCell>}
                          <TableCell>{record.next_step || "—"}</TableCell>
                          {visible.status && <TableCell><Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>{status?.icon && <status.icon width={16} height={16} color={theme.palette.text.secondary} aria-hidden="true" />}<span>{status?.label || "—"}</span></Stack></TableCell>}
                          <TableCell><IconButton size="small" aria-label={"Actions for " + record.name} onClick={(event) => { setActionRow(record); setRowAnchor(event.currentTarget); }} sx={{ width: 32, height: 32, color: "text.secondary" }}><MoreHorizontal size={16} /></IconButton></TableCell>
                        </TableRow>
                      );
                    })}
                    {records.length === 0 && <TableRow><TableCell colSpan={visibleColumnCount} align="center" sx={{ py: 5 }}>No results.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, mt: 2, gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">0 of {records.length} row(s) selected.</Typography>
                <Stack direction="row" spacing={{ xs: 1, lg: 3 }} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>Rows per page</Typography>
                    <Select size="small" value={rowsPerPage} onChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} sx={{ height: 32, width: 70, fontSize: 14, borderRadius: "calc(var(--radius) - 2px)" }}>
                      {[10, 20, 30, 40, 50].map((count) => <MenuItem key={count} value={count}>{count}</MenuItem>)}
                    </Select>
                  </Stack>
                  <Typography variant="body2" sx={{ width: 100, textAlign: "center", fontWeight: 500 }}>Page {currentPage + 1} of {pageCount}</Typography>
                  <Stack direction="row" spacing={1}>
                    <IconButton aria-label="Go to first page" disabled={currentPage === 0} onClick={() => setPage(0)} sx={{ ...compactOutline, width: 32, border: 1, display: { xs: "none", lg: "inline-flex" } }}><ChevronsLeft size={16} /></IconButton>
                    <IconButton aria-label="Go to previous page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} sx={{ ...compactOutline, width: 32, border: 1 }}><ChevronLeft size={16} /></IconButton>
                    <IconButton aria-label="Go to next page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)} sx={{ ...compactOutline, width: 32, border: 1 }}><ChevronRight size={16} /></IconButton>
                    <IconButton aria-label="Go to last page" disabled={currentPage >= pageCount - 1} onClick={() => setPage(pageCount - 1)} sx={{ ...compactOutline, width: 32, border: 1, display: { xs: "none", lg: "inline-flex" } }}><ChevronsRight size={16} /></IconButton>
                  </Stack>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => setStatusAnchor(null)}>
        {statuses.map((status) => <MenuItem key={status.value} onClick={() => { setSelectedStatuses((current) => current.includes(status.value) ? current.filter((item) => item !== status.value) : [...current, status.value]); setPage(0); }}><Checkbox size="small" checked={selectedStatuses.includes(status.value)} sx={{ p: 0.5, mr: 1 }} />{status.label}</MenuItem>)}
      </Menu>
      <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>
        <MenuItem disabled>Toggle columns</MenuItem><Divider />
        {(Object.keys(columnLabels) as OptionalColumn[]).map((column) => <MenuItem key={column} onClick={() => { setVisible((current) => ({ ...current, [column]: !current[column] })); if (column === "status" && visible.status) setSelectedStatuses([]); }}><Checkbox size="small" checked={visible[column]} sx={{ p: 0.5, mr: 1 }} />{columnLabels[column]}</MenuItem>)}
      </Menu>
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        <MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("asc"); } setSortAnchor(null); }}><ArrowUpIcon style={{ marginRight: 12 }} />Asc</MenuItem>
        <MenuItem onClick={() => { if (sortColumn) { setSortKey(sortColumn); setSortDirection("desc"); } setSortAnchor(null); }}><ArrowDownIcon style={{ marginRight: 12 }} />Desc</MenuItem>
        <Divider />
        <MenuItem onClick={() => { if (sortColumn) setVisible((current) => ({ ...current, [sortColumn]: false })); if (sortColumn === "status") setSelectedStatuses([]); setSortAnchor(null); }}>Hide</MenuItem>
      </Menu>
      <Menu anchorEl={rowAnchor} open={Boolean(rowAnchor)} onClose={closeRowMenu}>
        <MenuItem onClick={() => { if (actionRow) router.push("/crm/opportunities/" + actionRow.id); closeRowMenu(); }}>View</MenuItem>
        <MenuItem onClick={() => { setUpdateRow(actionRow); closeRowMenu(); }}>Update</MenuItem>
        <Divider />
        <MenuItem onClick={() => { setDeleteRow(actionRow); closeRowMenu(); }}>Delete</MenuItem>
      </Menu>

      <Drawer anchor="right" open={createOpen} onClose={() => setCreateOpen(false)} sx={{ zIndex: 40 }} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
        <Box sx={{ p: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box><Typography variant="h5">{t("opportunities.sheetTitle")}</Typography><Typography color="text.secondary" variant="body2">{t("opportunities.sheetDescription")}</Typography></Box>
          <IconButton aria-label="Close" onClick={() => setCreateOpen(false)}><X size={18} /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ overflowY: "auto", py: 3 }}>
          <NewOpportunityForm accounts={crmData.accounts} contacts={crmData.contacts} salesType={crmData.saleTypes} saleStages={crmData.saleStages} campaigns={crmData.campaigns} currencies={crmData.currencies} accountId={accountId} onDialogClose={closeCreate} />
        </Box>
      </Drawer>
      <Drawer anchor="right" open={Boolean(updateRow)} onClose={() => setUpdateRow(null)} sx={{ zIndex: 40 }} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
        <Box sx={{ p: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box><Typography variant="h5">Update Opportunity - {updateRow?.name}</Typography><Typography color="text.secondary" variant="body2">Update opportunity details</Typography></Box>
          <IconButton aria-label="Close" onClick={() => setUpdateRow(null)}><X size={18} /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ overflowY: "auto", py: 3 }}>
          {updateRow && <UpdateOpportunityForm initialData={updateRow} setOpen={(open) => { if (!open) closeUpdate(); }} saleTypes={crmData.saleTypes} saleStages={crmData.saleStages} campaigns={crmData.campaigns} currencies={crmData.currencies} />}
        </Box>
      </Drawer>
      <Dialog open={Boolean(deleteRow)} onClose={() => { if (!deleting) setDeleteRow(null); }}>
        <DialogTitle>Delete opportunity?</DialogTitle>
        <DialogContent><DialogContentText>This will delete {deleteRow?.name}. This action cannot be undone.</DialogContentText></DialogContent>
        <DialogActions><Button onClick={() => setDeleteRow(null)} disabled={deleting}>Cancel</Button><Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
