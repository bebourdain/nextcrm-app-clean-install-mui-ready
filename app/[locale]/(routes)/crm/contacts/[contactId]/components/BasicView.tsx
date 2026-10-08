import moment from "moment";
import { Box, Chip, Divider, Grid, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import { prismadb } from "@/lib/prisma";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { EnrichButton } from "./EnrichButton";
import { ContactDetailActions } from "./ContactDetailActions";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <Box sx={{ py: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
    <Typography variant="body2" color="text.secondary" component="div">{value || "N/A"}</Typography>
  </Box>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>{title}</Typography>
    <Divider sx={{ my: 2 }} />
    {children}
  </Paper>;
}

export async function BasicView({ data }: { data: any }) {
  const [users, crmData] = await Promise.all([prismadb.users.findMany(), getAllCrmData()]);
  if (!data) return <Typography>Contact not found</Typography>;
  const userName = (id: string | null | undefined) => users.find((user) => user.id === id)?.name || "N/A";
  const date = (value: Date | string | null | undefined) => value ? moment(value).format("MMM DD YYYY") : "N/A";
  const email = (value: string | null | undefined) => value ? <MuiLink href={`mailto:${value}`}>{value}</MuiLink> : "N/A";
  return <Stack spacing={2.5}>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }} spacing={2}>
        <Box>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>{data.first_name} {data.last_name}</Typography>
          <Typography variant="body2" color="text.secondary">ID: {data.id}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <EnrichButton contactId={data.id} contactEmail={data.email ?? null} contactCurrentData={{
            position: data.position ?? null, website: data.website ?? null, social_linkedin: data.social_linkedin ?? null,
            social_twitter: data.social_twitter ?? null, social_facebook: data.social_facebook ?? null,
            social_instagram: data.social_instagram ?? null, description: data.description ?? null,
            office_phone: data.office_phone ?? null, mobile_phone: data.mobile_phone ?? null,
          }} />
          <ContactDetailActions contact={data} contactTypes={crmData.contactTypes} />
        </Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Field label="Account" value={data.assigned_accounts?.name} />
          <Field label="Position" value={data.position} />
          <Field label="Birthday" value={date(data.birthday)} />
          <Field label="Description" value={data.description} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Field label="Assigned to" value={userName(data.assigned_to)} />
          <Field label="Created" value={date(data.created_on)} />
          <Field label="Created by" value={userName(data.createdBy)} />
          <Field label="Last update" value={date(data.updatedAt)} />
          <Field label="Last update by" value={userName(data.updatedBy)} />
          <Field label="Status" value={data.status ? "Active" : "Inactive"} />
          <Field label="Type" value={data.contact_type?.name} />
          <Field label="Member of" value={data.member_of} />
          <Field label="Industry" value={data.industry} />
        </Grid>
      </Grid>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>Tags</Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>{(data.tags ?? []).map((tag: string) => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Stack>
    </Paper>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}><Section title="Contacts">
        <Field label="E-mail" value={email(data.email)} />
        <Field label="Personal e-mail" value={email(data.personal_email)} />
        <Field label="Office phone" value={data.office_phone} />
        <Field label="Mobile phone" value={data.mobile_phone} />
        <Field label="Website" value={data.website ? <MuiLink href={data.website}>{data.website}</MuiLink> : undefined} />
        <Field label="Billing country" value={data.billing_country} />
      </Section></Grid>
      <Grid size={{ xs: 12, md: 6 }}><Section title="Social networks">
        <Field label="Twitter" value={data.social_twitter} />
        <Field label="Facebook" value={data.social_facebook} />
        <Field label="LinkedIn" value={data.social_linkedin} />
        <Field label="Skype" value={data.social_skype} />
        <Field label="Instagram" value={data.social_instagram} />
        <Field label="YouTube" value={data.social_youtube} />
        <Field label="TikTok" value={data.social_tiktok} />
      </Section></Grid>
    </Grid>
    <Section title="Notes">
      <Stack spacing={1}>{(data.notes ?? []).map((note: string, index: number) => <Typography key={`${index}-${note}`} variant="body2" color="text.secondary">{note}</Typography>)}</Stack>
    </Section>
  </Stack>;
}
