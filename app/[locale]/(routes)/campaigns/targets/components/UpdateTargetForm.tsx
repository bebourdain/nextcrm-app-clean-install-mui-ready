"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updateTarget } from "@/actions/crm/targets/update-target";
import { convertTarget } from "@/actions/crm/targets/convert-target";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { MuiTargetFormFields } from "./MuiTargetFormFields";

type UpdateTargetFormProps = {
  initialData: any;
  setOpen: (value: boolean) => void;
};

export function UpdateTargetForm({ initialData, setOpen }: UpdateTargetFormProps) {
  const router = useRouter();
  const [converting, setConverting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    const result = await convertTarget(initialData.id);
    setConverting(false);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Converted! Account and Contact created.");
      router.refresh();
    }
  };

  const formSchema = z.object({
    first_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
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

  type UpdateTargetFormValues = z.infer<typeof formSchema>;

  const form = useForm<UpdateTargetFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      first_name: initialData.first_name || "",
      last_name: initialData.last_name || "",
      email: initialData.email || "",
      mobile_phone: initialData.mobile_phone || "",
      office_phone: initialData.office_phone || "",
      company: initialData.company || "",
      company_website: initialData.company_website || "",
      personal_website: initialData.personal_website || "",
      position: initialData.position || "",
      social_x: initialData.social_x || "",
      social_linkedin: initialData.social_linkedin || "",
      social_instagram: initialData.social_instagram || "",
      social_facebook: initialData.social_facebook || "",
      personal_email: initialData?.personal_email || "",
      company_email: initialData?.company_email || "",
      company_phone: initialData?.company_phone || "",
      city: initialData?.city || "",
      country: initialData?.country || "",
      industry: initialData?.industry || "",
      employees: initialData?.employees || "",
      description: initialData?.description || "",
      status: initialData.status ?? true,
    },
  });

  const onSubmit = async (data: UpdateTargetFormValues) => {
    const result = await updateTarget({ id: initialData.id, ...data });
    if (result?.error) {
      form.setError("root.serverError", { message: result.error });
    } else {
      toast.success("Target updated successfully");
      setOpen(false);
    }
  };

  return <Box component="form" onSubmit={form.handleSubmit(onSubmit)} sx={{ py: 1 }}>
    <MuiTargetFormFields form={form} mode="update" />
    {form.formState.errors.root?.serverError?.message && <Alert severity="error" sx={{ mt: 2 }} role="alert">{String(form.formState.errors.root.serverError.message)}</Alert>}
    {initialData?.converted_at ? <Alert severity="info" sx={{ mt: 2 }}>Converted to Account + Contact on {new Date(initialData.converted_at).toLocaleDateString()}</Alert> :
      <Button type="button" variant="outlined" disabled={converting} onClick={() => setConfirmOpen(true)} sx={{ mt: 2 }}>Convert to Account</Button>}
    <Button variant="contained" fullWidth disabled={form.formState.isSubmitting} type="submit" sx={{ mt: 2 }}>
      {form.formState.isSubmitting ? "Saving data ..." : "Update target"}
    </Button>
    <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
      <DialogTitle>Convert to Account + Contact?</DialogTitle>
      <DialogContent><DialogContentText>
        This creates a new Account from &quot;{initialData?.company || initialData?.last_name}&quot; and a new Contact for &quot;{initialData?.first_name} {initialData?.last_name}&quot;. The target will be marked as converted.
      </DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => setConfirmOpen(false)}>Cancel</Button><Button onClick={async () => { await handleConvert(); setConfirmOpen(false); }} disabled={converting}>{converting ? "Converting..." : "Convert"}</Button></DialogActions>
    </Dialog>
  </Box>;
}
