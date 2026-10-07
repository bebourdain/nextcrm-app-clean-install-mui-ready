import Link from "next/link";
import moment from "moment";
import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { EnrichButton } from "./EnrichButton";
import ConvertToDealButton from "./ConvertToDealButton";
import { TargetContactsTable } from "./TargetContactsTable";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return <Box sx={{ py: 1 }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="body2" color="text.secondary" component="div">{value || "N/A"}</Typography></Box>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}><Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>{title}</Typography><Divider sx={{ my: 2 }} />{children}</Paper>;
}
export async function BasicView({ data }: { data: any }) {
  if (!data) return <Typography>Target not found</Typography>;
  const date = (value: Date | string | null | undefined) => value ? moment(value).format("MMM DD YYYY") : "N/A";
  const email = data.email ? <Link href={`mailto:${data.email}`}>{data.email}</Link> : undefined;
  const website = (value: string | null | undefined) => value ? <Link href={value} target="_blank" rel="noopener noreferrer">{value}</Link> : undefined;
  return <Stack spacing={2.5}>
    <Paper variant="outlined" sx={{ p: 3, borderRadius: "var(--radius)" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}>
        <Box><Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>{data.first_name} {data.last_name}</Typography><Typography variant="body2" color="text.secondary">ID: {data.id}</Typography></Box>
        <Stack direction="row" spacing={1}><EnrichButton targetId={data.id} /><ConvertToDealButton targetId={data.id} /></Stack>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}><Field label="Company" value={data.company} /><Field label="Position" value={data.position} /><Field label="Company website" value={website(data.company_website)} /><Field label="Personal website" value={website(data.personal_website)} /></Grid>
        <Grid size={{ xs: 12, md: 6 }}><Field label="Created by" value={data.crate_by_user?.name} /><Field label="Created on" value={date(data.created_on)} /><Field label="Last updated" value={date(data.updatedAt)} /><Field label="Status" value={data.status ? "Active" : "Inactive"} /></Grid>
      </Grid>
      {!!data.tags?.length && <Box sx={{ mt: 2 }}><Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Tags</Typography><Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>{data.tags.map((tag: string) => <Chip key={tag} label={tag} variant="outlined" size="small" />)}</Stack></Box>}
    </Paper>
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}><Section title="Contact information"><Field label="E-mail" value={email} /><Field label="Mobile phone" value={data.mobile_phone} /><Field label="Office phone" value={data.office_phone} /></Section></Grid>
      <Grid size={{ xs: 12, md: 6 }}><Section title="Social networks"><Field label="X (Twitter)" value={data.social_x} /><Field label="LinkedIn" value={data.social_linkedin} /><Field label="Instagram" value={data.social_instagram} /><Field label="Facebook" value={data.social_facebook} /></Section></Grid>
    </Grid>
    {!!data.notes?.length && <Section title="Notes"><Stack spacing={1}>{data.notes.map((note: string, index: number) => <Typography key={`${index}-${note}`} variant="body2" color="text.secondary">{note}</Typography>)}</Stack></Section>}
    {!!data.target_lists?.length && <Section title="Target Lists"><Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>{data.target_lists.map((item: any) => <Chip key={item.target_list_id} label={item.target_list?.name ?? "—"} size="small" />)}</Stack></Section>}
    <Section title="Contacts"><TargetContactsTable targetId={data.id} contacts={data.target_contacts ?? []} /></Section>
  </Stack>;
}
