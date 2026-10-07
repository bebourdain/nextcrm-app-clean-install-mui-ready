"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, Tab } from "@mui/material";

const tabs = [
  { label: "Settings", href: "/admin/invoices/settings" },
  { label: "Series", href: "/admin/invoices/series" },
  { label: "Tax Rates", href: "/admin/invoices/tax-rates" },
];

export function InvoicesTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const active = tabs.find((tab) => pathname.endsWith(tab.href) || pathname.includes(`${tab.href}/`))?.href ?? tabs[0].href;
  return <Tabs value={active} onChange={(_, href: string) => router.push(href)} aria-label="Invoice sections" variant="scrollable" scrollButtons="auto">
    {tabs.map((tab) => <Tab key={tab.href} value={tab.href} label={tab.label} />)}
  </Tabs>;
}
