import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { prismadb } from "@/lib/prisma";
import { setResendKey } from "@/actions/admin/system/set-resend-key";
import CopyKeyComponent from "./copy-key";

export default async function ResendCard() {
  const resend_key = await prismadb.systemServices.findFirst({ where: { name: "resend_smtp" } });
  return <Paper variant="outlined" sx={{ p: 3, width: "100%", maxWidth: 450 }}><Typography variant="h6">Resend.com - API Key</Typography><Stack spacing={1} sx={{ mt: 2 }}><Typography variant="caption" color="text.secondary">ENV API key:</Typography>{process.env.RESEND_API_KEY ? <CopyKeyComponent keyValue={process.env.RESEND_API_KEY} message="Resend - API Key" /> : <Typography variant="body2">not enabled</Typography>}<Typography variant="caption" color="text.secondary">API key from DB:</Typography>{resend_key?.serviceKey ? <CopyKeyComponent keyValue={resend_key.serviceKey} message="Resend - API Key" /> : <Typography variant="body2">not enabled</Typography>}</Stack><Box component="form" action={setResendKey} sx={{ mt: 2 }}><input type="hidden" name="id" value={resend_key?.id} /><TextField name="serviceKey" type="text" label="Your API key" size="small" fullWidth /><Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", mt: 2 }}><Button type="reset">Reset</Button><Button type="submit" variant="contained">Set Resend key</Button></Stack></Box></Paper>;
}
