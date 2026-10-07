"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createAccount } from "@/actions/crm/accounts/create-account";
import { useSession } from "@/lib/auth-client";
import { MuiAccountFormFields } from "./MuiAccountFormFields";

export function NewAccountForm({ industries, onFinish }: { industries: { id: string; name: string }[]; onFinish: () => void }) {
  const t = useTranslations("CrmAccountForm");
  const { data: session } = useSession();
  const schema = z.object({
    name: z.string().min(1, t("nameRequired")).max(100),
    office_phone: z.string().max(50).optional(),
    website: z.string().url(t("websiteInvalid")).optional().or(z.literal("")),
    fax: z.string().max(50).optional(),
    company_id: z.string().max(20).optional(),
    vat: z.string().max(20).optional(),
    email: z.string().email(t("emailInvalid")).optional().or(z.literal("")),
    billing_street: z.string().max(100).optional(),
    billing_postal_code: z.string().max(20).optional(),
    billing_city: z.string().max(100).optional(),
    billing_state: z.string().max(100).optional(),
    billing_country: z.string().max(100).optional(),
    shipping_street: z.string().max(100).optional(),
    shipping_postal_code: z.string().max(20).optional(),
    shipping_city: z.string().max(100).optional(),
    shipping_state: z.string().max(100).optional(),
    shipping_country: z.string().max(100).optional(),
    description: z.string().max(1000).optional(),
    assigned_to: z.string().optional(),
    status: z.string().optional(),
    annual_revenue: z.string().optional(),
    member_of: z.string().max(100).optional(),
    industry: z.string().optional(),
  });
  const form = useForm<any>({ resolver: zodResolver(schema), mode: "onBlur", defaultValues: { name: "", assigned_to: "" } });
  useEffect(() => {
    const userId = session?.user?.id;
    if (userId && !form.getValues("assigned_to")) form.setValue("assigned_to", userId);
  }, [session, form]);
  const onSubmit = async (data: z.infer<typeof schema>) => {
    const result = await createAccount(data);
    if (result?.error) { form.setError("root.serverError", { message: result.error }); return; }
    toast.success(t("createSuccess"));
    form.reset();
    onFinish();
  };
  return <form onSubmit={form.handleSubmit(onSubmit)}><MuiAccountFormFields form={form} industries={industries} mode="create" /></form>;
}
