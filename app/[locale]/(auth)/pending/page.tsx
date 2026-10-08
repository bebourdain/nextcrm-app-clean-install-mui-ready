import { Box, Button, Divider, Link as MuiLink, Paper, Stack, Typography } from "@mui/material";
import { getSession } from "@/lib/auth-server";
import { prismadb } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TryAgain from "./components/TryAgain";

export default async function PendingPage() {
  const [adminUsers, session] = await Promise.all([
    prismadb.users.findMany({ where: { role: "admin", userStatus: "ACTIVE" } }),
    getSession(),
  ]);
  if (session?.user.userStatus !== "PENDING") redirect("/");

  return <Paper variant="outlined" sx={{ width: "100%", maxWidth: 760, p: { xs: 3, sm: 5 } }}>
    <Stack spacing={3}>
      <Box><Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>{process.env.NEXT_PUBLIC_APP_NAME} — account approval pending</Typography><Typography color="text.secondary">Ask an administrator in your organization to approve your account.</Typography></Box>
      <Divider />
      <Box><Typography variant="h6" sx={{ mb: 1.5 }}>Administrators</Typography><Stack spacing={1.5}>{adminUsers.map((user) => <Paper key={user.id} variant="outlined" sx={{ p: 2 }}><Typography sx={{ fontWeight: 600 }}>{user.name || "Administrator"}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>{user.id}</Typography>{user.email && <MuiLink href={`mailto:${user.email}`}>{user.email}</MuiLink>}</Paper>)}</Stack></Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: { sm: "center" } }}><Button component="a" href="/sign-in" variant="outlined">Log in with another account</Button><TryAgain /></Stack>
    </Stack>
  </Paper>;
}
