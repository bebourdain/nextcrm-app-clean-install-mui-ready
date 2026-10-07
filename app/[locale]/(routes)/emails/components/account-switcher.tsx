"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Box, MenuItem, Select, Tooltip } from "@mui/material";
import type { ConnectedAccount } from "@/app/[locale]/(routes)/emails/data";

export function AccountSwitcher({ isCollapsed, accounts, activeAccountId }: { isCollapsed: boolean; accounts: ConnectedAccount[]; activeAccountId?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedAccount = activeAccountId ?? accounts[0]?.id ?? "";
  const account = accounts.find((item) => item.id === selectedAccount);
  const switchAccount = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("accountId", id);
    router.push(`?${params.toString()}`);
  };
  return <Tooltip title={isCollapsed ? account?.label ?? "Select account" : ""} placement="right">
    <Box sx={{ width: "100%" }}><Select
      size="small" fullWidth value={selectedAccount} onChange={(event) => switchAccount(event.target.value)}
      inputProps={{ "aria-label": "Select account" }}
      renderValue={(id) => isCollapsed ? (accounts.find((item) => item.id === id)?.label?.slice(0, 1) ?? "@").toUpperCase() : accounts.find((item) => item.id === id)?.label ?? "Select an account"}
      sx={isCollapsed ? { width: 44, height: 36, "& .MuiSelect-select": { py: 0.75, px: 1, textAlign: "center" }, "& .MuiSelect-icon": { display: "none" } } : { width: "100%" }}
    >
      {accounts.map((item) => <MenuItem key={item.id} value={item.id}>{item.label} ({item.username})</MenuItem>)}
    </Select></Box>
  </Tooltip>;
}
