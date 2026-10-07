"use client";

import { Controller, type UseFormReturn } from "react-hook-form";
import { Box, FormControlLabel, Grid, Switch, TextField } from "@mui/material";

const fields = [
  ["first_name", "First name", "John"], ["last_name", "Last name", "Doe"],
  ["email", "Email", "john@example.com"], ["mobile_phone", "Mobile phone", "+1 234 567 890"],
  ["office_phone", "Office phone", "+1 234 567 891"], ["position", "Position", "CEO"],
  ["company", "Company", "Acme Corp"], ["company_website", "Company website", "https://acme.com"],
  ["personal_website", "Personal website", "https://johndoe.com"],
  ["social_x", "X (Twitter)", "https://x.com/john"], ["social_linkedin", "LinkedIn", "https://linkedin.com/in/john"],
  ["social_instagram", "Instagram", "https://instagram.com/john"], ["social_facebook", "Facebook", "https://facebook.com/john"],
  ["personal_email", "Personal Email", "john@personal.com"], ["company_email", "Company Email", "info@company.com"],
  ["company_phone", "Company Phone", "+1 800 000 0000"], ["city", "City", "Prague"],
  ["country", "Country", "Czech Republic"], ["industry", "Industry", "SaaS"],
  ["employees", "Employees", "50-200"], ["description", "Description", "Short company description"],
] as const;

export function MuiTargetFormFields({ form, mode }: { form: UseFormReturn<any>; mode: "create" | "update" }) {
  const disabled = form.formState.isSubmitting;
  return <Box>
    <Grid container spacing={2}>
      {fields.map(([name, label, placeholder]) => <Grid key={name} size={{ xs: 12, sm: name === "description" || name === "personal_website" ? 12 : 6 }}>
        <Controller control={form.control} name={name} render={({ field, fieldState }) =>
          <TextField {...field} value={field.value ?? ""} fullWidth label={name === "last_name" && mode === "update" ? `${label} *` : label}
            placeholder={placeholder} disabled={disabled} error={!!fieldState.error} helperText={fieldState.error?.message} />}
        />
      </Grid>)}
    </Grid>
    <Box sx={{ mt: 2 }}><Controller control={form.control} name="status" render={({ field }) =>
      <FormControlLabel label="Is target active?" control={<Switch checked={!!field.value} onChange={(_, checked) => field.onChange(checked)} disabled={disabled} />} />}
    /></Box>
  </Box>;
}
