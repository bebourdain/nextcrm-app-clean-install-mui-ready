import { redirect } from "next/navigation";
import { Box } from "@mui/material";
import { requireRole, AuthorizationError, AuthenticationError } from "@/lib/authz";
import { AdminSidebarNav } from "./_components/AdminSidebarNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireRole(["admin"]);
  } catch (error) {
    if (error instanceof AuthenticationError) redirect("/sign-in");
    if (error instanceof AuthorizationError) redirect("/");
    throw error;
  }
  return <Box sx={{ display: "flex", width: "100%", minHeight: 0, height: "100%", flexDirection: { xs: "column", md: "row" } }}><Box component="aside" sx={{ width: { xs: "100%", md: 224 }, flexShrink: 0, borderRight: { md: 1 }, borderBottom: { xs: 1, md: 0 }, borderColor: "divider", bgcolor: "background.paper", p: 1 }}><AdminSidebarNav /></Box><Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>{children}</Box></Box>;
}
