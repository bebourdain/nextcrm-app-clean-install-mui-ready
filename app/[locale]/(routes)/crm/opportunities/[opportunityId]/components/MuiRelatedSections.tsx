"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Box, Button, Card, CardContent, Divider, Drawer, IconButton, Stack, Typography } from "@mui/material";

import type { getAllCrmData } from "@/actions/crm/get-crm-data";
import { columns as accountColumns } from "../../../accounts/table-components/columns";
import { AccountDataTable } from "../../../accounts/table-components/data-table";
import { NewAccountForm } from "../../../accounts/components/NewAccountForm";
import { createColumns as contactColumns } from "../../../contacts/table-components/columns";
import { ContactsDataTable } from "../../../contacts/table-components/data-table";
import { NewContactForm } from "../../../contacts/components/NewContactForm";
import { columns as documentColumns } from "@/app/[locale]/(routes)/documents/components/columns";
import { DocumentsDataTable } from "@/app/[locale]/(routes)/documents/components/data-table";

type CrmData = Awaited<ReturnType<typeof getAllCrmData>>;

function RelatedHeader({ title, href, addLabel, addTestId, onAdd }: { title: string; href: string; addLabel?: string; addTestId?: string; onAdd?: () => void }) {
  return (
    <Box sx={{ p: 3, pb: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h5" component="h2">
          <Button component={Link} href={href} variant="text" sx={{ color: "text.primary", p: 0, fontSize: "inherit", fontWeight: "inherit", "&:hover": { bgcolor: "transparent", textDecoration: "underline" } }}>
            {title}
          </Button>
        </Typography>
        {addLabel && <Button variant="contained" size="small" aria-label={addLabel} data-testid={addTestId} onClick={onAdd}>+</Button>}
      </Stack>
      <Divider sx={{ mt: 2.5 }} />
    </Box>
  );
}

function FormDrawer({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description: string; children: ReactNode }) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Stack direction="row" sx={{ p: 3, alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose}><X size={18} /></IconButton>
      </Stack>
      <Divider />
      <Box sx={{ p: 3, overflowY: "auto" }}>{children}</Box>
    </Drawer>
  );
}

export function MuiOpportunityAccounts({ crmData, data }: { crmData: CrmData; data: any[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("CrmPage");
  return (
    <>
      <Card>
        <RelatedHeader title={t("accounts.viewTitle")} href="/crm/accounts" addLabel={t("accounts.addNew")} addTestId="add-account-btn" onAdd={() => setOpen(true)} />
        <CardContent sx={{ pt: 1.5 }}>
          {data?.length ? <AccountDataTable data={data} columns={accountColumns} industries={crmData.industries} /> : <Typography variant="body2" color="text.secondary">{t("accounts.empty")}</Typography>}
        </CardContent>
      </Card>
      <FormDrawer open={open} onClose={() => setOpen(false)} title={t("accounts.sheetTitle")} description={t("accounts.sheetDescription")}>
        <NewAccountForm industries={crmData.industries} onFinish={() => setOpen(false)} />
      </FormDrawer>
    </>
  );
}

export function MuiOpportunityContacts({ crmData, data }: { crmData: CrmData; data: any[] }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("CrmPage");
  return (
    <>
      <Card>
        <RelatedHeader title={t("contacts.viewTitle")} href="/crm/contacts" addLabel={t("contacts.addNew")} addTestId="add-contact-btn" onAdd={() => setOpen(true)} />
        <CardContent sx={{ pt: 1.5 }}>
          {data?.length ? <ContactsDataTable data={data} columns={contactColumns(crmData.contactTypes)} /> : <Typography variant="body2" color="text.secondary">{t("contacts.empty")}</Typography>}
        </CardContent>
      </Card>
      <FormDrawer open={open} onClose={() => setOpen(false)} title={t("contacts.sheetTitle")} description={t("contacts.sheetDescription")}>
        <NewContactForm accounts={crmData.accounts} onFinish={() => setOpen(false)} />
      </FormDrawer>
    </>
  );
}

export function MuiOpportunityDocuments({ data }: { data: any[] }) {
  return (
    <Card>
      <RelatedHeader title="Documents" href="/documents" />
      <CardContent sx={{ pt: 1.5 }}>
        {data?.length ? <DocumentsDataTable data={data} columns={documentColumns} /> : <Typography variant="body2" color="text.secondary">No assigned documents found</Typography>}
      </CardContent>
    </Card>
  );
}
