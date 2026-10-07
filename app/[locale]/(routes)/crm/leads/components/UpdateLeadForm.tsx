"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateLead } from "@/actions/crm/leads/update-lead";
import { MuiLeadFormFields } from "./MuiLeadFormFields";

type ConfigItem = { id: string; name: string };
type Props = { initialData: any; setOpen: (value: boolean) => void; leadSources: ConfigItem[]; leadStatuses: ConfigItem[]; leadTypes: ConfigItem[] };

export function UpdateLeadForm({ initialData, setOpen, leadSources, leadStatuses, leadTypes }: Props) {
  const t = useTranslations("CrmLeadForm");
  const schema = z.object({
    id: z.uuid(), firstName: z.string().optional().nullable(), lastName: z.string().min(1, t("lastNameRequired")).max(30),
    company: z.string().nullable().optional(), jobTitle: z.string().nullable().optional(), email: z.string().email(t("emailInvalid")).nullable().optional().or(z.literal("")),
    phone: z.string().min(0).max(15).nullable().optional(), description: z.string().nullable().optional(), lead_source_id: z.string().nullable().optional(),
    lead_status_id: z.string().nullable().optional(), lead_type_id: z.string().nullable().optional(), refered_by: z.string().nullable().optional(),
    campaign: z.string().nullable().optional(), assigned_to: z.string().nullable().optional(), accountsIDs: z.string().nullable().optional(),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur", defaultValues: {
    ...initialData, firstName: initialData?.firstName ?? "", lastName: initialData?.lastName ?? "", lead_source_id: initialData?.lead_source_id ?? "",
    lead_status_id: initialData?.lead_status_id ?? "", lead_type_id: initialData?.lead_type_id ?? "", accountsIDs: initialData?.accountsIDs ?? "",
  } });
  const submit = async (data: Values) => {
    const result = await updateLead({ ...data, lead_source_id: data.lead_source_id ?? undefined, lead_status_id: data.lead_status_id ?? undefined, lead_type_id: data.lead_type_id ?? undefined, assigned_to: data.assigned_to ?? undefined, accountIDs: data.accountsIDs ?? undefined });
    if (result?.error) { form.setError("root.serverError", { message: result.error }); return; }
    toast.success(t("updateSuccess")); setOpen(false);
  };
  if (!initialData) return null;
  return <form onSubmit={form.handleSubmit(submit)}><MuiLeadFormFields control={form.control} submitting={form.formState.isSubmitting} errors={form.formState.errors.root?.serverError?.message} submitLabel={t("updateButton")} leadSources={leadSources} leadStatuses={leadStatuses} leadTypes={leadTypes} mode="update" /></form>;
}
