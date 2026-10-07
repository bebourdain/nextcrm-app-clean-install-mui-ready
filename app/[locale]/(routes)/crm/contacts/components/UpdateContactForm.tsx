"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Alert, Box, Button } from "@mui/material";
import { MuiContactFormFields } from "./MuiContactFormFields";
import { updateContact } from "@/actions/crm/contacts/update-contact";

//TODO: fix all the types
type ConfigItem = { id: string; name: string };

type UpdateContactFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
  contactTypes: ConfigItem[];
};

export function UpdateContactForm({
  initialData,
  setOpen,
  contactTypes,
}: UpdateContactFormProps) {
  const t = useTranslations("CrmContactForm");
  const c = useTranslations("Common");

  const formSchema = z.object({
    id: z.uuid(),
    birthday_year: z.string().optional().nullable(),
    birthday_month: z.string().optional().nullable(),
    birthday_day: z.string().optional().nullable(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().min(1, t("lastNameRequired")),
    description: z.string().nullable().optional(),
    email: z.string().email(t("emailInvalid")).optional().or(z.literal("")),
    personal_email: z.string().nullable().optional(),
    office_phone: z.string().nullable().optional(),
    mobile_phone: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    position: z.string().nullable().optional(),
    status: z.boolean(),
    contact_type_id: z.string().optional(),
    assigned_to: z.string(),
    assigned_account: z.string().nullable().optional(),
    social_twitter: z.string().nullable().optional(),
    social_facebook: z.string().nullable().optional(),
    social_linkedin: z.string().nullable().optional(),
    social_skype: z.string().nullable().optional(),
    social_youtube: z.string().nullable().optional(),
    social_tiktok: z.string().nullable().optional(),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  // Parse birthday from initialData (single date) into year/month/day components
  // Coerce null → "" (strings) or false (booleans) to keep inputs controlled and pass Zod validation
  const parsedInitialData = {
    ...initialData,
    last_name: initialData.last_name ?? "",
    email: initialData.email ?? "",
    contact_type_id: initialData.contact_type_id ?? "",
    assigned_to: initialData.assigned_to ?? "",
    status: initialData.status ?? false,
    first_name: initialData.first_name ?? "",
    description: initialData.description ?? "",
    personal_email: initialData.personal_email ?? "",
    office_phone: initialData.office_phone ?? "",
    mobile_phone: initialData.mobile_phone ?? "",
    website: initialData.website ?? "",
    position: initialData.position ?? "",
    assigned_account: initialData.accountsIDs ?? "",
    social_twitter: initialData.social_twitter ?? "",
    social_facebook: initialData.social_facebook ?? "",
    social_linkedin: initialData.social_linkedin ?? "",
    social_skype: initialData.social_skype ?? "",
    social_youtube: initialData.social_youtube ?? "",
    social_tiktok: initialData.social_tiktok ?? "",
    birthday_year: initialData.birthday ? new Date(initialData.birthday).getFullYear().toString() : "",
    birthday_month: initialData.birthday ? (new Date(initialData.birthday).getMonth() + 1).toString() : "",
    birthday_day: initialData.birthday ? new Date(initialData.birthday).getDate().toString() : "",
  };

  //TODO: fix this any
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: parsedInitialData,
  });

  const onSubmit = async (data: NewAccountFormValues) => {
    const result = await updateContact(data);
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success(t("updateSuccess"));
      setOpen(false);
    }
  };

  if (!initialData)
    return <div>{c("somethingWentWrong")}</div>;

  return (
    <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ pb: 2 }}>
      <MuiContactFormFields form={form} mode="update" contactTypes={contactTypes} />
      {form.formState.errors.root?.serverError?.message && <Alert severity="error" sx={{ mb: 2 }}>{String(form.formState.errors.root.serverError.message)}</Alert>}
      <Button variant="contained" disabled={form.formState.isSubmitting} type="submit">
        {form.formState.isSubmitting ? "Saving..." : t("updateButton")}
      </Button>
    </Box>
  );
}
