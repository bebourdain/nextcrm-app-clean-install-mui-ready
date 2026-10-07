import { Suspense } from "react";
import { Box, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { CoinsIcon, Contact, DollarSignIcon, FilePenLine, FileText, HeartHandshakeIcon, LandmarkIcon, Megaphone, Target, UserIcon, type LucideIcon } from "lucide-react";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import LoadingBox from "./components/dasboard/loading-box";
import StorageQuota from "./components/dasboard/storage-quota";
import { getSession } from "@/lib/auth-server";
import { getTasksCount, getUsersTasksCount } from "@/actions/dashboard/get-tasks-count";
import { getInvoicesCount } from "@/actions/dashboard/get-invoices-count";
import { getCampaignsCount } from "@/actions/dashboard/get-campaigns-count";
import { getTargetsCount } from "@/actions/dashboard/get-targets-count";
import { getLeadsCount } from "@/actions/dashboard/get-leads-count";
import { getBoardsCount } from "@/actions/dashboard/get-boards-count";
import { getStorageSize } from "@/actions/documents/get-storage-size";
import { getContactCount } from "@/actions/dashboard/get-contacts-count";
import { getAccountsCount } from "@/actions/dashboard/get-accounts-count";
import { getContractsCount } from "@/actions/dashboard/get-contracts-count";
import { getDocumentsCount } from "@/actions/dashboard/get-documents-count";
import { getActiveUsersCount } from "@/actions/dashboard/get-active-users-count";
import { getOpportunitiesCount } from "@/actions/dashboard/get-opportunities-count";
import { getExpectedRevenue } from "@/actions/crm/opportunity/get-expected-revenue";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { getDefaultCurrency, formatCurrency as formatCurrencyUtil } from "@/lib/currency";
import { Decimal } from "@prisma/client/runtime/client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const userId = session.user.id;
  const cookieStore = await cookies();
  const defaultCurrency = await getDefaultCurrency();
  const displayCurrency = cookieStore.get("display_currency")?.value || defaultCurrency;
  const dict = await getTranslations("DashboardPage");
  const leads = await getLeadsCount();
  const tasks = await getTasksCount();
  const invoices = await getInvoicesCount();
  const campaigns = await getCampaignsCount();
  const targets = await getTargetsCount();
  const storage = await getStorageSize();
  const projects = await getBoardsCount();
  const contacts = await getContactCount();
  const contracts = await getContractsCount();
  const users = await getActiveUsersCount();
  const accounts = await getAccountsCount();
  const revenue = await getExpectedRevenue(displayCurrency);
  const documents = await getDocumentsCount();
  const opportunities = await getOpportunitiesCount();
  const usersTasks = await getUsersTasksCount(userId);
  const metrics: { href?: string; title: string; IconComponent: LucideIcon; content: number | string }[] = [
    { title: dict("totalRevenue"), IconComponent: DollarSignIcon, content: "0" },
    { title: dict("expectedRevenue"), IconComponent: DollarSignIcon, content: formatCurrencyUtil(new Decimal(revenue), displayCurrency) },
    { href: "/admin/users", title: dict("activeUsers"), IconComponent: UserIcon, content: users },
    { href: "/invoices", title: dict("invoices"), IconComponent: FileText, content: invoices },
    { href: "/campaigns", title: dict("campaigns"), IconComponent: Megaphone, content: campaigns },
    { href: "/crm/targets", title: dict("targets"), IconComponent: Target, content: targets },
    { href: "/crm/accounts", title: dict("accounts"), IconComponent: LandmarkIcon, content: accounts },
    { href: "/crm/opportunities", title: dict("opportunities"), IconComponent: HeartHandshakeIcon, content: opportunities },
    { href: "/crm/contacts", title: dict("contacts"), IconComponent: Contact, content: contacts },
    { href: "/crm/leads", title: dict("leads"), IconComponent: CoinsIcon, content: leads },
    { href: "/crm/contracts", title: dict("contracts"), IconComponent: FilePenLine, content: contracts },
    { href: "/projects", title: dict("projects"), IconComponent: CoinsIcon, content: projects },
    { href: "/projects/tasks", title: dict("tasks"), IconComponent: CoinsIcon, content: tasks },
    { href: `/projects/tasks/${userId}`, title: dict("myTasks"), IconComponent: CoinsIcon, content: usersTasks },
    { href: "/documents", title: dict("documents"), IconComponent: CoinsIcon, content: documents },
  ];
  return <Box sx={{ width: "100%", pb: 6 }}>
    <MuiPageHeader title={dict("containerTitle")} description="Welcome to NextCRM cockpit, here you can see your company overview" />
    <Divider sx={{ my: 2 }} />
    <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" } }}>
      {metrics.map((metric) => <Suspense key={metric.title} fallback={<LoadingBox />}><DashboardCard {...metric} /></Suspense>)}
      <StorageQuota actual={storage} title={dict("storage")} />
    </Box>
  </Box>;
}

function DashboardCard({ href, title, IconComponent, content }: { href?: string; title: string; IconComponent: LucideIcon; content: number | string }) {
  const card = <Card variant="outlined" sx={{ height: "100%", transition: "border-color .2s, box-shadow .2s", ...(href ? { "&:hover": { borderColor: "primary.main", boxShadow: 2 } } : {}) }}>
    <CardContent>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Box component="span" sx={{ color: "text.secondary", display: "inline-flex" }}><IconComponent size={18} /></Box>
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>{content}</Typography>
    </CardContent>
  </Card>;
  return href ? <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>{card}</Link> : card;
}
