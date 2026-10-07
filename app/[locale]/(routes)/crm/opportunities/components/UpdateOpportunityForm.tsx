"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { updateOpportunity } from "@/actions/crm/opportunities/update-opportunity";
import { MuiOpportunityFormFields, type OpportunityFormValues } from "./MuiOpportunityFormFields";

type ConfigItem = { id: string; name: string };

type UpdateOpportunityFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
  saleTypes: ConfigItem[];
  saleStages: ConfigItem[];
  campaigns: ConfigItem[];
  currencies: { code: string; name: string; symbol: string }[];
};

function asDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function UpdateOpportunityForm({
  initialData,
  setOpen,
  saleTypes,
  saleStages,
  campaigns,
  currencies,
}: UpdateOpportunityFormProps) {
  const t = useTranslations("CrmOpportunityForm");
  const c = useTranslations("Common");

  const schema = z.object({
    id: z.uuid().optional(),
    name: z.string().min(1, t("nameRequired")),
    close_date: z.date({ message: "A expected close date is required." }),
    delivery_deadline: z.date().optional(),
    description: z.string(),
    type: z.string(),
    sales_stage: z.string(),
    budget: z.string(),
    currency: z.string(),
    expected_revenue: z.string(),
    next_step: z.string(),
    assigned_to: z.string(),
    account: z.string(),
    contact: z.string(),
    campaign: z.string(),
  });

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      id: initialData?.id,
      name: initialData?.name ?? "",
      close_date: asDate(initialData?.close_date),
      delivery_deadline: asDate(initialData?.delivery_deadline),
      description: initialData?.description ?? "",
      type: initialData?.type ?? "",
      sales_stage: initialData?.sales_stage ?? "",
      budget: String(initialData?.budget ?? ""),
      currency: initialData?.currency ?? "",
      expected_revenue: String(initialData?.expected_revenue ?? ""),
      next_step: initialData?.next_step ?? "",
      assigned_to: initialData?.assigned_to ?? "",
      account: initialData?.account ?? "",
      contact: initialData?.contact ?? "",
      campaign: initialData?.campaign ?? "",
    },
  });

  const onSubmit = async (data: OpportunityFormValues) => {
    if (!data.id) {
      form.setError("root.serverError", { message: c("somethingWentWrong") });
      return;
    }
    const result = await updateOpportunity({ ...data, id: data.id });
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
      return;
    }
    toast.success(t("updateSuccess"));
    setOpen(false);
  };

  if (!initialData) return <div>{c("somethingWentWrong")}</div>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <MuiOpportunityFormFields
        form={form}
        mode="update"
        saleTypes={saleTypes}
        saleStages={saleStages}
        campaigns={campaigns}
        currencies={currencies}
      />
    </form>
  );
}
