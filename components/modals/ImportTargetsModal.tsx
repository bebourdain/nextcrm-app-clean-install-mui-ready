"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { importTargets } from "@/actions/crm/targets/import-targets";
import { suggestMapping } from "@/actions/crm/targets/suggest-mapping";
import { parseSpreadsheetFile } from "@/lib/spreadsheet/parse";
import { TARGET_FIELDS } from "@/lib/spreadsheet/target-fields";
import { toast } from "sonner";
import { Close } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Upload } from "lucide-react";

type Step = "upload" | "mapping" | "preview";

const SKIP_VALUE = "__skip__";

const ImportTargetsModal = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  // mapping: targetField -> csvHeader (or SKIP_VALUE)
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const resetState = () => {
    setStep("upload");
    setSelectedFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setMapping({});
    setIsLoading(false);
    setIsSuggesting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetState();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      const rows = await parseSpreadsheetFile(file);
      const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
      setCsvHeaders(headers);
      setCsvRows(rows);
      fetchSuggestedMapping(headers);
    } catch {
      toast.error("Could not parse the selected file.");
    }
  };

  const fetchSuggestedMapping = useCallback(async (headers: string[]) => {
    setIsSuggesting(true);
    setStep("mapping");
    try {
      const res = await suggestMapping(headers);
      const suggested: Record<string, string | null> = res.mapping ?? {};
      // Convert from { csvHeader -> targetField } to { targetField -> csvHeader }
      const newMapping: Record<string, string> = {};
      for (const field of TARGET_FIELDS) {
        newMapping[field.key] = SKIP_VALUE;
      }
      for (const [csvHeader, targetField] of Object.entries(suggested)) {
        if (targetField && newMapping[targetField] === SKIP_VALUE) {
          newMapping[targetField] = csvHeader;
        }
      }
      setMapping(newMapping);
    } catch {
      // Set all to skip on error
      const newMapping: Record<string, string> = {};
      for (const field of TARGET_FIELDS) {
        newMapping[field.key] = SKIP_VALUE;
      }
      setMapping(newMapping);
    } finally {
      setIsSuggesting(false);
    }
  }, []);

  const computePreview = () => {
    let valid = 0;
    let skipped = 0;
    const skipReasons: string[] = [];

    for (let i = 0; i < csvRows.length; i++) {
      const raw = csvRows[i];
      const row: Record<string, string> = {};
      for (const field of TARGET_FIELDS) {
        const csvCol = mapping[field.key];
        if (csvCol && csvCol !== SKIP_VALUE) {
          row[field.key] = raw[csvCol] ?? "";
        }
      }

      if (!row.last_name && !row.company) {
        skipped++;
        if (skipReasons.length < 3) skipReasons.push(`Row ${i + 2}: missing Last Name or Company`);
        continue;
      }
      valid++;
    }

    return { valid, skipped, skipReasons };
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    // Build mapping as { csvHeader -> targetField } for the API
    const apiMapping: Record<string, string> = {};
    for (const [targetField, csvCol] of Object.entries(mapping)) {
      if (csvCol && csvCol !== SKIP_VALUE) {
        apiMapping[csvCol] = targetField;
      }
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mapping", JSON.stringify(apiMapping));

    try {
      const { imported, skipped, errors } = await importTargets(formData);
      toast.success(`Imported: ${imported}, Skipped: ${skipped}${errors.length > 0 ? `. Errors: ${errors.slice(0, 3).join("; ")}` : ""}`);
      setOpen(false);
      resetState();
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const preview = step === "preview" ? computePreview() : null;

  return (
    <>
      <Button variant="outlined" size="small" startIcon={<Upload size={16} />} onClick={() => setOpen(true)}>
        Import CSV / Excel
      </Button>
      <Dialog open={open} onClose={() => !isLoading && handleOpenChange(false)} fullWidth maxWidth="md" slotProps={{ paper: { sx: { maxHeight: "90vh" } } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box>
            Import Targets
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              Step {step === "upload" ? 1 : step === "mapping" ? 2 : 3} of 3
            </Typography>
          </Box>
          <IconButton aria-label="Close import dialog" size="small" disabled={isLoading} onClick={() => handleOpenChange(false)}><Close fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 3 }}>
            {step === "upload" && "Select a CSV or Excel (.xlsx) file to import targets."}
            {step === "mapping" && "Map your CSV columns to target fields. AI has pre-filled suggestions — adjust as needed."}
            {step === "preview" && "Review the import summary before proceeding."}
          </DialogContentText>

          {step === "upload" && (
            <Paper variant="outlined" sx={{ borderStyle: "dashed", borderWidth: 2, p: 4, textAlign: "center" }}>
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={handleFileChange} hidden />
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>Select file</Button>
              {selectedFile && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Selected: {selectedFile.name}</Typography>}
            </Paper>
          )}

          {step === "mapping" && (
            isSuggesting ? (
              <Stack direction="row" spacing={1} sx={{ py: 5, justifyContent: "center", alignItems: "center" }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">AI is suggesting column mappings…</Typography>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, px: 1 }}>
                  <Typography variant="caption" color="text.secondary">CRM Field</Typography>
                  <Typography variant="caption" color="text.secondary">CSV Column</Typography>
                </Box>
                {TARGET_FIELDS.map((field) => (
                  <Box key={field.key} sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, alignItems: "center" }}>
                    <Typography variant="body2">
                      {field.label}{field.required && <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>}
                    </Typography>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      aria-label={`CSV column for ${field.label}`}
                      value={mapping[field.key] ?? SKIP_VALUE}
                      onChange={(event) => setMapping((current) => ({ ...current, [field.key]: event.target.value }))}
                    >
                      <MenuItem value={SKIP_VALUE}>— skip —</MenuItem>
                      {csvHeaders.map((header) => <MenuItem key={header} value={header}>{header}</MenuItem>)}
                    </TextField>
                  </Box>
                ))}
                <Typography variant="caption" color="text.secondary">
                  <Typography component="span" color="error">*</Typography> last_name or company is required per row.
                </Typography>
              </Stack>
            )
          )}

          {step === "preview" && preview && (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2">
                  Ready to import <Box component="span" sx={{ color: "success.main", fontWeight: 600 }}>{preview.valid} row{preview.valid !== 1 ? "s" : ""}</Box>
                  {preview.skipped > 0 && <> — <Box component="span" sx={{ color: "warning.main", fontWeight: 600 }}>{preview.skipped} row{preview.skipped !== 1 ? "s" : ""} will be skipped</Box></>}.
                </Typography>
                {preview.skipReasons.length > 0 && (
                  <Box component="ul" sx={{ pl: 2.5, mb: 0, color: "text.secondary" }}>
                    {preview.skipReasons.map((reason, index) => <Typography component="li" variant="caption" key={index}>{reason}</Typography>)}
                    {preview.skipped > preview.skipReasons.length && <Typography component="li" variant="caption">…and {preview.skipped - preview.skipReasons.length} more</Typography>}
                  </Box>
                )}
              </Paper>
              {preview.valid === 0 && <Alert severity="error">No valid rows to import. Go back and adjust your column mapping.</Alert>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {step === "upload" && <Button onClick={() => handleOpenChange(false)}>Cancel</Button>}
          {step === "mapping" && <>
            <Button onClick={() => setStep("upload")}>Back</Button>
            <Button variant="contained" onClick={() => setStep("preview")} disabled={isSuggesting}>Next</Button>
          </>}
          {step === "preview" && <>
            <Button onClick={() => setStep("mapping")} disabled={isLoading}>Back</Button>
            <Button variant="contained" onClick={handleImport} disabled={isLoading || !preview || preview.valid === 0} startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}>
              {isLoading ? "Importing…" : "Import"}
            </Button>
          </>}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImportTargetsModal;
