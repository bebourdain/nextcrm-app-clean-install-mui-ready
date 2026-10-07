"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress, Divider, Drawer, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { updateContract } from "@/actions/crm/contracts/update-contract";
import { getAccounts } from "@/actions/crm/accounts/get-accounts";
import { getCurrencies } from "@/actions/crm/get-currencies";
import { ContractFormFields, type ContractFormData } from "./ContractFormFields";

type Contract = ContractFormData & { id: string; v: number };

export default function UpdateContractForm({ onOpen, setOpen, data }: { onOpen: boolean; setOpen: (open: boolean) => void; data: Contract }) {
  const router = useRouter();
  const [assignedTo, setAssignedTo] = useState(data.assigned_to ?? "");
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [currencies, setCurrencies] = useState<{ code: string; name: string; symbol: string }[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  useEffect(() => {
    if (!onOpen) return;
    let active = true;
    void Promise.all([getAccounts(), getCurrencies()]).then(([accountsResult, currenciesResult]) => {
      if (!active) return;
      if ("data" in accountsResult && accountsResult.data) setAccounts(accountsResult.data);
      if ("data" in currenciesResult && currenciesResult.data) setCurrencies(currenciesResult.data);
    }).finally(() => { if (active) setLoadingData(false); });
    return () => { active = false; };
  }, [onOpen]);
  const { execute, fieldErrors, isLoading } = useAction(updateContract, {
    onSuccess: () => { toast.success("Contract updated successfully"); setOpen(false); router.refresh(); },
    onError: (message) => toast.error(message),
  });
  const onAction = async (formData: FormData) => {
    await execute({
      id: data.id,
      v: data.v,
      title: String(formData.get("title") ?? ""),
      value: String(formData.get("value") ?? ""),
      currency: String(formData.get("currency") ?? ""),
      startDate: new Date(String(formData.get("startDate") ?? "")),
      endDate: new Date(String(formData.get("endDate") ?? "")),
      renewalReminderDate: new Date(String(formData.get("renewalReminderDate") ?? "")),
      customerSignedDate: new Date(String(formData.get("customerSignedDate") ?? "")),
      companySignedDate: new Date(String(formData.get("companySignedDate") ?? "")),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? "NOTSTARTED") as Parameters<typeof updateContract>[0]["status"],
      account: String(formData.get("account") ?? ""),
      assigned_to: assignedTo,
    });
  };
  return <Drawer anchor="right" open={onOpen} onClose={() => setOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", md: 771 }, maxWidth: "100%" } } }}>
    <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box><Typography variant="h5">Update contract — {data.title}</Typography><Typography variant="body2" color="text.secondary">Update contract details, dates, status, and assignments.</Typography></Box>
      <IconButton aria-label="Close" onClick={() => setOpen(false)}><X size={18} /></IconButton>
    </Box>
    <Divider />
    <Box sx={{ overflowY: "auto", pt: 3 }}>
      {loadingData ? <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress size={24} /></Box> :
        <ContractFormFields mode="update" data={data} accounts={accounts} currencies={currencies} assignedTo={assignedTo} onAssignedToChange={setAssignedTo} fieldErrors={fieldErrors ?? {}} isLoading={isLoading} onAction={onAction} />}
    </Box>
  </Drawer>;
}
