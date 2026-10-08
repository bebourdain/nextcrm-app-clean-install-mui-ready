"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Icons } from "@/components/ui/icons";
import { Box, Button, Card, CardContent, CardHeader, Divider, Stack, TextField, Typography } from "@mui/material";
import { toast } from "sonner";
import { MailIcon } from "lucide-react";

type Step = "email" | "otp";

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (error) {
      toast.error("Something went wrong with Google sign-in.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (error) {
        toast.error(error.message || "Failed to send verification code.");
        return;
      }
      setStep("otp");
      toast.success("Verification code sent to your email.");
    } catch (error) {
      toast.error("Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp,
      });
      if (error) {
        toast.error(error.message || "Invalid or expired code.");
        return;
      }
      toast.success("Login successful.");
      window.location.href = "/";
    } catch (error) {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ my: 2, width: "100%", maxWidth: 560 }}>
      <CardHeader title={<Typography variant="h5" sx={{ fontWeight: 700 }}>Login</Typography>} subheader="Choose your sign-in method" />
      <CardContent>
        <Stack spacing={2.5}>
          <Button fullWidth variant="outlined" onClick={loginWithGoogle} disabled={isLoading} startIcon={<Icons.google style={{ width: 16, height: 16 }} />}>Continue with Google</Button>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><Divider sx={{ flex: 1 }} /><Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase" }}>Or continue with email</Typography><Divider sx={{ flex: 1 }} /></Stack>
          {step === "email" && <Box component="form" onSubmit={(event) => { event.preventDefault(); void sendOtp(); }}>
            <Stack spacing={1.5}>
              <TextField fullWidth id="email" type="email" label="Email" placeholder="name@domain.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isLoading} autoComplete="email" required />
              <Button fullWidth type="submit" variant="contained" disabled={isLoading || !email} startIcon={<MailIcon size={16} />}>Send verification code</Button>
            </Stack>
          </Box>}
          {step === "otp" && <Box component="form" onSubmit={(event) => { event.preventDefault(); void verifyOtp(); }}>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">Enter the 6-digit code sent to <Box component="strong" sx={{ color: "text.primary" }}>{email}</Box></Typography>
              <TextField fullWidth label="6-digit verification code" type="text" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={isLoading} autoComplete="one-time-code" slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*", maxLength: 6, "aria-label": "6-digit verification code" } }} sx={{ "& input": { textAlign: "center", letterSpacing: "0.5em", fontSize: 20 } }} />
              <Button fullWidth type="submit" variant="contained" disabled={isLoading || otp.length !== 6}>Verify and sign in</Button>
              <Button fullWidth size="small" onClick={() => { setStep("email"); setOtp(""); }} disabled={isLoading}>Use a different email</Button>
            </Stack>
          </Box>}
        </Stack>
      </CardContent>
    </Card>
  );
}
