"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createTarget } from "@/actions/crm/targets/create-target";

import { Alert, Box, Button } from "@mui/material";
import { MuiTargetFormFields } from "./MuiTargetFormFields";

type NewTargetFormProps = {
  onFinish: () => void;
};

export function NewTargetForm({ onFinish }: NewTargetFormProps) {
  const formSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    mobile_phone: z.string().optional(),
    office_phone: z.string().optional(),
    company: z.string().optional(),
    company_website: z.string().optional(),
    personal_website: z.string().optional(),
    position: z.string().optional(),
    social_x: z.string().optional(),
    social_linkedin: z.string().optional(),
    social_instagram: z.string().optional(),
    social_facebook: z.string().optional(),
    personal_email: z.string().optional(),
    company_email:  z.string().optional(),
    company_phone:  z.string().optional(),
    city:           z.string().optional(),
    country:        z.string().optional(),
    industry:       z.string().optional(),
    employees:      z.string().optional(),
    description:    z.string().optional(),
    status: z.boolean(),
  });

  type NewTargetFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewTargetFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      status: true,
      personal_email: "",
      company_email: "",
      company_phone: "",
      city: "",
      country: "",
      industry: "",
      employees: "",
      description: "",
    },
  });

  const onSubmit = async (data: NewTargetFormValues) => {
    if (!data.last_name && !data.company) {
      form.setError("root.serverError", {
        message: "Please provide either last name or company.",
      });
      return;
    }
    const result = await createTarget(data);
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success("Target created successfully");
      form.reset({ status: true });
      onFinish();
    }
  };

  return <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ py: 1 }}>
    <MuiTargetFormFields form={form} mode="create" />
    {form.formState.errors.root?.serverError?.message && <Alert severity="error" sx={{ mt: 2 }} role="alert">{String(form.formState.errors.root.serverError.message)}</Alert>}
    <Button variant="contained" fullWidth disabled={form.formState.isSubmitting} type="submit" sx={{ mt: 2 }}>
      {form.formState.isSubmitting ? "Saving data ..." : "Create target"}
    </Button>
  </Box>;
}
