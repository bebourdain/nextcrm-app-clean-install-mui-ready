"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createLead } from "@/actions/crm/leads/create-lead";
import { useSession } from "@/lib/auth-client";
import { MuiLeadFormFields } from "./MuiLeadFormFields";

type ConfigItem = { id: string; name: string };
type Props = { accounts: { id: string; name: string }[]; leadSources: ConfigItem[]; leadStatuses: ConfigItem[]; leadTypes: ConfigItem[]; accountId?: string; onFinish?: () => void };

export function NewLeadForm({ leadSources, leadStatuses, leadTypes, accountId, onFinish }: Props) {
  const t = useTranslations("CrmLeadForm");
  const { data: session } = useSession();
  const schema = z.object({
    first_name: z.string().optional(), last_name: z.string().min(1, t("lastNameRequired")).max(30), company: z.string().optional(), jobTitle: z.string().optional(),
    email: z.string().email(t("emailInvalid")).or(z.literal("")).optional(), phone: z.string().min(0).max(15).optional(), description: z.string().optional(),
    lead_source_id: z.string().optional(), lead_status_id: z.string().optional(), lead_type_id: z.string().optional(), refered_by: z.string().optional(),
    campaign: z.string().optional(), assigned_to: z.string().optional(), accountIDs: z.string().optional(),
  });
  type Values = z.infer<typeof schema>;
  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onBlur", defaultValues: {
    first_name: "", last_name: "", company: "", jobTitle: "", email: "", phone: "", description: "", lead_source_id: "", lead_status_id: "", lead_type_id: "", refered_by: "", campaign: "", assigned_to: "", accountIDs: accountId ?? "",
  } });
  useEffect(() => { const id = session?.user?.id; if (id && !form.getValues("assigned_to")) form.setValue("assigned_to", id); }, [session, form]);
  const submit = async (data: Values) => {
    const result = await createLead(data);
    if (result?.error) { form.setError("root.serverError", { message: result.error }); return; }
    toast.success(t("createSuccess")); form.reset(); onFinish?.();
  };
  return <form onSubmit={form.handleSubmit(submit)}><MuiLeadFormFields control={form.control} submitting={form.formState.isSubmitting} errors={form.formState.errors.root?.serverError?.message} submitLabel={t("createButton")} leadSources={leadSources} leadStatuses={leadStatuses} leadTypes={leadTypes} mode="create" fixedAccountId={accountId} /></form>;
}
