"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DownloadOutlined, UploadFileOutlined } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { importProducts } from "@/actions/crm/products/import-products";

const CSV_TEMPLATE = `name,sku,type,category,description,unit_price,unit_cost,currency,tax_rate,unit,is_recurring,billing_period
"Cloud Hosting Basic","SKU-001","SERVICE","Software","Basic cloud hosting plan",99.00,45.00,"USD",20,"per month",true,MONTHLY
"Office Chair","SKU-002","PRODUCT","Hardware","Ergonomic office chair",299.00,150.00,"USD",20,"per unit",false,`;

type ImportResult = { imported: number; skipped: number; errors: string[] };

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "", inQuotes = false;
  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === "," && !inQuotes) { cells.push(current.trim()); current = ""; }
    else current += char;
  }
  cells.push(current.trim());
  return cells;
}

export function ImportProductsDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setOpen(false); setFile(null); setHeaders([]); setPreview([]); setResult(null); setIsImporting(false);
    if (fileRef.current) fileRef.current.value = "";
  };
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([CSV_TEMPLATE], { type: "text/csv" }));
    const link = document.createElement("a"); link.href = url; link.download = "products_import_template.csv"; link.click(); URL.revokeObjectURL(url);
  };
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]; if (!selected) return;
    setFile(selected); setResult(null);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const lines = String(loadEvent.target?.result ?? "").split("\n").filter((line) => line.trim());
      setHeaders(lines[0] ? parseCsvLine(lines[0]) : []);
      setPreview(lines.slice(1, 6).map(parseCsvLine));
    };
    reader.readAsText(selected);
  };
  const onImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const data = new FormData(); data.append("file", file);
      const response = await importProducts(data);
      setResult(response);
      if (response.imported > 0) router.refresh();
    } catch (error) {
      setResult({ imported: 0, skipped: 0, errors: [error instanceof Error ? error.message : "Import failed"] });
    } finally { setIsImporting(false); }
  };

  return <>
    <Button variant="outlined" startIcon={<UploadFileOutlined />} onClick={() => setOpen(true)}>Import</Button>
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" aria-labelledby="import-products-title">
      <DialogTitle id="import-products-title">Import Products from CSV</DialogTitle>
      <DialogContent dividers><Stack spacing={2.5}>
        <Typography color="text.secondary">Upload a CSV file to bulk import products. Download the template to see the expected format.</Typography>
        <Box><Button variant="outlined" size="small" startIcon={<DownloadOutlined />} onClick={downloadTemplate}>Download CSV Template</Button></Box>
        <Button component="label" variant="outlined" sx={{ alignSelf: "flex-start" }}>Choose CSV file<input ref={fileRef} hidden type="file" accept=".csv" onChange={onFileChange} /></Button>
        {file && <Typography variant="body2" color="text.secondary">Selected: {file.name}</Typography>}
        {preview.length > 0 && <Box>
          <TableContainer sx={{ maxHeight: 260, border: 1, borderColor: "divider", borderRadius: 1 }}><Table size="small" stickyHeader>
            <TableHead><TableRow>{headers.map((header, index) => <TableCell key={`${header}-${index}`} sx={{ whiteSpace: "nowrap" }}>{header}</TableCell>)}</TableRow></TableHead>
            <TableBody>{preview.map((row, rowIndex) => <TableRow key={rowIndex}>{row.map((cell, cellIndex) => <TableCell key={cellIndex} sx={{ whiteSpace: "nowrap" }}>{cell}</TableCell>)}</TableRow>)}</TableBody>
          </Table></TableContainer>
          <Typography variant="caption" color="text.secondary">Showing first {preview.length} row(s) of preview</Typography>
        </Box>}
        {result && <Stack spacing={1}>
          {result.imported > 0 && <Alert severity="success">{result.imported} product(s) imported successfully</Alert>}
          {result.skipped > 0 && <Alert severity="warning">{result.skipped} row(s) skipped</Alert>}
          {result.errors.length > 0 && <Alert severity="error">{result.errors.length} error(s): {result.errors.join("; ")}</Alert>}
        </Stack>}
      </Stack></DialogContent>
      <DialogActions><Button onClick={close}>{result ? "Done" : "Cancel"}</Button>{file && !result && <Button variant="contained" onClick={onImport} disabled={isImporting}>{isImporting ? <CircularProgress size={22} color="inherit" /> : "Confirm Import"}</Button>}</DialogActions>
    </Dialog>
  </>;
}
