"use client";

import { useState } from "react";
import { Box, Button, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useAction } from "@/hooks/use-action";
import { createNewContract } from "@/actions/crm/contracts/create-new-contract";
import { ContractFormFields } from "./ContractFormFields";

type Account = { id: string; name: string };
type Currency = { code: string; name: string; symbol: string };

export default function CreateContractForm({ accounts, accountId, currencies = [] }: { accounts: Account[]; accountId: string; currencies?: Currency[] }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const currentAssignedTo = assignedTo ?? session?.user?.id ?? "";
  const { execute, fieldErrors, isLoading } = useAction(createNewContract, {
    onSuccess: () => { toast.success("Contract created successfully"); setOpen(false); router.refresh(); },
    onError: (message) => toast.error(message),
  });
  const onAction = async (formData: FormData) => {
    await execute({
      title: String(formData.get("title") ?? ""),
      value: String(formData.get("value") ?? ""),
      currency: String(formData.get("currency") ?? ""),
      startDate: new Date(String(formData.get("startDate") ?? "")),
      endDate: new Date(String(formData.get("endDate") ?? "")),
      renewalReminderDate: new Date(String(formData.get("renewalReminderDate") ?? "")),
      customerSignedDate: new Date(String(formData.get("customerSignedDate") ?? "")),
      companySignedDate: new Date(String(formData.get("companySignedDate") ?? "")),
      description: String(formData.get("description") ?? ""),
      account: String(formData.get("account") ?? ""),
      assigned_to: currentAssignedTo,
    });
  };
  return <>
    <Button variant="contained" aria-label="Create contract" onClick={() => setOpen(true)} sx={{ minWidth: 36, my: 1 }}>+</Button>
    <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
      <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box><Typography variant="h5">Create contract</Typography><Typography variant="body2" color="text.secondary">Create a contract with terms, dates, and an assigned user.</Typography></Box>
        <IconButton aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></IconButton>
      </Box>
      <Divider />
      <Box sx={{ overflowY: "auto", pt: 3 }}><ContractFormFields mode="create" accounts={accounts} currencies={currencies} fixedAccountId={accountId || undefined} assignedTo={currentAssignedTo} onAssignedToChange={setAssignedTo} fieldErrors={fieldErrors ?? {}} isLoading={isLoading} onAction={onAction} /></Box>
    </Drawer>
  </>;
}
