"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type {
  crm_Accounts,
  crm_Contacts,
  crm_Opportunities_Sales_Stages,
  crm_Opportunities_Type,
  crm_campaigns,
} from "@prisma/client";

import { createOpportunity } from "@/actions/crm/opportunities/create-opportunity";
import { useSession } from "@/lib/auth-client";
import { MuiOpportunityFormFields, type OpportunityFormValues } from "./MuiOpportunityFormFields";

type NewOpportunityFormProps = {
  accounts: crm_Accounts[];
  contacts: crm_Contacts[];
  salesType: crm_Opportunities_Type[];
  saleStages: crm_Opportunities_Sales_Stages[];
  campaigns: crm_campaigns[];
  currencies: { code: string; name: string; symbol: string }[];
  selectedStage?: string;
  accountId?: string;
  onDialogClose: () => void;
};

export function NewOpportunityForm({
  accounts,
  contacts,
  salesType,
  saleStages,
  campaigns,
  currencies,
  selectedStage,
  accountId,
  onDialogClose,
}: NewOpportunityFormProps) {
  const t = useTranslations("CrmOpportunityForm");
  const { data: session } = useSession();

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
      name: "",
      close_date: undefined,
      delivery_deadline: undefined,
      description: "",
      type: "",
      sales_stage: selectedStage ?? "",
      budget: "",
      currency: "",
      expected_revenue: "",
      next_step: "",
      assigned_to: "",
      account: accountId ?? "",
      contact: "",
      campaign: "",
    },
  });

  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && !form.getValues("assigned_to")) form.setValue("assigned_to", userId);
  }, [session, form]);

  const onSubmit = async (data: OpportunityFormValues) => {
    const result = await createOpportunity({ ...data, name: data.name });
    if (result?.error) {
      form.setError("root.serverError", { message: result.error || t("createError") });
      return;
    }
    toast.success(t("createSuccess"));
    form.reset();
    onDialogClose();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <MuiOpportunityFormFields
        form={form}
        mode="create"
        saleTypes={salesType}
        saleStages={saleStages}
        campaigns={campaigns}
        currencies={currencies}
        accounts={accounts}
        contacts={contacts}
        selectedStage={selectedStage}
        fixedAccountId={accountId}
      />
    </form>
  );
}
