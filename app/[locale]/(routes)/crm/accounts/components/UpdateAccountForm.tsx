"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Box, Skeleton, Typography } from "@mui/material";
import { updateAccount } from "@/actions/crm/accounts/update-account";
import { getIndustries } from "@/actions/crm/get-industries";
import { MuiAccountFormFields, type AccountFormValues } from "./MuiAccountFormFields";

export function UpdateAccountForm({ initialData, open }: { initialData: any; open: (value: boolean) => void }) {
  const t = useTranslations("CrmAccountForm");
  const c = useTranslations("Common");
  const [industries, setIndustries] = useState<{ id: string; name: string }[] | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let current = true;
    getIndustries().then((data) => { if (current) setIndustries(data); }).catch(() => { if (current) setIndustries(null); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, []);
  const schema = z.object({
    id: z.uuid(),
    name: z.string().min(1, t("nameRequired")).max(100),
    office_phone: z.string().max(50).optional().nullable(),
    website: z.string().url(t("websiteInvalid")).optional().nullable().or(z.literal("")),
    fax: z.string().max(50).optional().nullable(),
    company_id: z.string().max(20).optional().nullable(),
    vat: z.string().max(20).optional().nullable(),
    email: z.string().email(t("emailInvalid")).optional().nullable().or(z.literal("")),
    billing_street: z.string().max(100).optional().nullable(),
    billing_postal_code: z.string().max(20).optional().nullable(),
    billing_city: z.string().max(100).optional().nullable(),
    billing_state: z.string().max(100).optional().nullable(),
    billing_country: z.string().max(100).optional().nullable(),
    shipping_street: z.string().max(100).optional().nullable(),
    shipping_postal_code: z.string().max(20).optional().nullable(),
    shipping_city: z.string().max(100).optional().nullable(),
    shipping_state: z.string().max(100).optional().nullable(),
    shipping_country: z.string().max(100).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    assigned_to: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    annual_revenue: z.string().optional().nullable(),
    member_of: z.string().max(100).optional().nullable(),
    industry: z.string().optional().nullable(),
  });
  const form = useForm<any>({ resolver: zodResolver(schema), mode: "onBlur", defaultValues: initialData });
  const onSubmit = async (data: AccountFormValues) => {
    const payload = Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value === null ? undefined : value])) as Parameters<typeof updateAccount>[0];
    const result = await updateAccount(payload);
    if (result?.error) { form.setError("root.serverError", { message: result.error }); return; }
    toast.success(t("updateSuccess"));
    open(false);
  };
  if (loading) return <Box sx={{ px: 4, py: 2 }}><Skeleton /><Skeleton /><Skeleton width="75%" /></Box>;
  if (!industries || !initialData) return <Typography sx={{ p: 3 }}>{c("somethingWentWrong")}</Typography>;
  return <form onSubmit={form.handleSubmit(onSubmit)}><MuiAccountFormFields form={form} industries={industries} mode="update" /></form>;
}
