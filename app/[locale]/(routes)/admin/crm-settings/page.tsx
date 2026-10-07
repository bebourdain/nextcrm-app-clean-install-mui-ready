import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getConfigValues } from "./_actions/crm-settings";
import { CrmSettingsTabs } from "./_components/CrmSettingsTabs";

export default async function CrmSettingsPage() {
  const [
    industries,
    contactTypes,
    leadSources,
    leadStatuses,
    leadTypes,
    opportunityTypes,
    salesStages,
  ] = await Promise.all([
    getConfigValues("industry"),
    getConfigValues("contactType"),
    getConfigValues("leadSource"),
    getConfigValues("leadStatus"),
    getConfigValues("leadType"),
    getConfigValues("opportunityType"),
    getConfigValues("salesStage"),
  ]);

  const tabs = [
    { key: "industry" as const,        label: "Industries",        values: industries },
    { key: "contactType" as const,     label: "Contact Types",     values: contactTypes },
    { key: "leadSource" as const,      label: "Lead Sources",      values: leadSources },
    { key: "leadStatus" as const,      label: "Lead Statuses",     values: leadStatuses },
    { key: "leadType" as const,        label: "Lead Types",        values: leadTypes },
    { key: "opportunityType" as const, label: "Opportunity Types", values: opportunityTypes },
    { key: "salesStage" as const,      label: "Sales Stages",      values: salesStages },
  ];

  return <Box sx={{ p: 3 }}><MuiPageHeader title="CRM Settings" description="Manage default values used across CRM modules." /><Box sx={{ mt: 3 }}><CrmSettingsTabs tabs={tabs} /></Box></Box>;
}
