"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Box, Button, Dialog, DialogContent, DialogTitle, Divider, Paper, Stack, Typography } from "@mui/material";

import { createColumns } from "../contacts/table-components/columns";
import { NewContactForm } from "../contacts/components/NewContactForm";
import { ContactsDataTable } from "../contacts/table-components/data-table";
import type { getAllCrmData } from "@/actions/crm/get-crm-data";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;

interface ContactsViewProps {
  data: any[];
  crmData: CrmData;
  accountId?: string;
}

const ContactsView = ({ data, crmData, accountId }: ContactsViewProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("CrmPage");

  return <Paper variant="outlined" sx={{ borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)" }}>
    <Box sx={{ p: 3, pb: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          <Link href="/crm/contacts" style={{ color: "inherit", textDecoration: "none" }}>{t("contacts.viewTitle")}</Link>
        </Typography>
        <Button variant="contained" aria-label={t("contacts.addNew")} data-testid="add-contact-btn" onClick={() => setOpen(true)} sx={{ minWidth: 36, my: 1 }}>+</Button>
      </Stack>
      <Divider sx={{ mt: 2.5 }} />
    </Box>
    <Box sx={{ px: 3, pb: 3 }}>
      {!data?.length ? <Typography variant="body2">{t("contacts.empty")}</Typography> : <ContactsDataTable data={data} columns={createColumns(crmData.contactTypes)} />}
    </Box>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle>{t("contacts.sheetTitle")}</DialogTitle>
      <DialogContent dividers>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>{t("contacts.sheetDescription")}</Typography>
        <NewContactForm accounts={crmData.accounts} accountId={accountId} onFinish={() => { setOpen(false); router.refresh(); }} />
      </DialogContent>
    </Dialog>
  </Paper>;
};

export default ContactsView;
