"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { columns } from "@/app/[locale]/(routes)/documents/components/columns";
import { DocumentsDataTable } from "@/app/[locale]/(routes)/documents/components/data-table";
import { BulkUploadModal } from "@/app/[locale]/(routes)/documents/components/bulk-upload-modal";

export default function DocumentsView({ data, accountId }: { data: any; accountId?: string }) {
  const router = useRouter();
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}><Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "center" }}><Button color="inherit" onClick={() => router.push("/documents")} sx={{ p: 0, minWidth: 0, textTransform: "none" }}><Typography variant="h6" sx={{ fontWeight: 600 }}>Documents</Typography></Button>{accountId && <BulkUploadModal accountId={accountId} />}</Stack><Divider sx={{ my: 2 }} /><Box>{!data || data.length === 0 ? <Typography variant="body2">No assigned documents found</Typography> : <DocumentsDataTable data={data} columns={columns} />}</Box></Paper>;
}
