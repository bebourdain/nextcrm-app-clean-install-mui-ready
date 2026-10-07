"use client";

import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, Box, Button } from "@mui/material";
import { MuiContactFormFields } from "./MuiContactFormFields";
import { createContact } from "@/actions/crm/contacts/create-contact";
import { useSession } from "@/lib/auth-client";

type AccountOption = {
  id: string;
  name: string;
};

type NewContactFormProps = {
  accounts: AccountOption[];
  accountId?: string;
  onFinish: () => void;
};

export function NewContactForm({
  accounts,
  accountId,
  onFinish,
}: NewContactFormProps) {
  const t = useTranslations("CrmContactForm");
  const { data: session } = useSession();

  const formSchema = z.object({
    birthday_year: z.string().optional(),
    birthday_month: z.string().optional(),
    birthday_day: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().min(1, t("lastNameRequired")),
    description: z.string().optional(),
    email: z.union([z.string().email(t("emailInvalid")), z.literal("")]).optional(),
    personal_email: z.string().optional(),
    office_phone: z.string().optional(),
    mobile_phone: z.string().optional(),
    website: z.string().optional(),
    position: z.string().optional(),
    status: z.boolean(),
    type: z.string(),
    assigned_to: z.string(),
    assigned_account: z.string().optional(),
    social_twitter: z.string().optional(),
    social_facebook: z.string().optional(),
    social_linkedin: z.string().optional(),
    social_skype: z.string().optional(),
    social_youtube: z.string().optional(),
    social_tiktok: z.string().optional(),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      first_name: "",
      last_name: "",
      description: "",
      email: "",
      personal_email: "",
      office_phone: "",
      mobile_phone: "",
      website: "",
      position: "",
      status: false,
      type: "",
      assigned_to: "",
      assigned_account: accountId ?? "",
      social_twitter: "",
      social_facebook: "",
      social_linkedin: "",
      social_skype: "",
      social_youtube: "",
      social_tiktok: "",
      birthday_year: undefined,
      birthday_month: undefined,
      birthday_day: undefined,
    },
  });

  useEffect(() => {
    const uid = session?.user?.id;
    if (uid && !form.getValues("assigned_to")) form.setValue("assigned_to", uid);
  }, [session, form]);

  const onSubmit = async (data: NewAccountFormValues) => {
    const { type, assigned_to, assigned_account, ...rest } = data;
    const result = await createContact({
      ...rest,
      assigned_to: assigned_to || undefined,
      assigned_account: assigned_account || undefined,
      contact_type_id: type || undefined,
    });
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success(t("createSuccess"));
      form.reset();
      onFinish();
    }
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ pb: 2 }}>
      <MuiContactFormFields form={form} mode="create" accounts={accounts} accountId={accountId} />
      {form.formState.errors.root?.serverError?.message && <Alert severity="error" sx={{ mb: 2 }}>{String(form.formState.errors.root.serverError.message)}</Alert>}
      <Button variant="contained" disabled={form.formState.isSubmitting} type="submit" data-testid="contact-submit-btn">
        {form.formState.isSubmitting ? "Saving..." : t("createButton")}
      </Button>
    </Box>
  );
}
