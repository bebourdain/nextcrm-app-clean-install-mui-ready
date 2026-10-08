import { GithubIcon, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";

import "@/app/[locale]/globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import getGithubRepoStars from "@/actions/github/get-repo-stars";
import { DiscordLogoIcon } from "@radix-ui/react-icons";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "RootLayout" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  //Get github stars from github api
  const githubStars = await getGithubRepoStars();

  return <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", width: "100%", bgcolor: "background.default" }}>
    <Stack component="header" direction="row" spacing={1} sx={{ width: "100%", p: 2, alignItems: "center", justifyContent: "flex-end" }}>
      <IconButton component="a" href={process.env.NEXT_PUBLIC_GITHUB_REPO_URL || "#"} aria-label="GitHub" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><GithubIcon size={20} /></IconButton>
      <Paper variant="outlined" sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.5, height: 40 }}><Typography variant="caption" component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>GitHub stars</Typography><Typography variant="body2">{githubStars}</Typography><Star size={16} /></Paper>
      <IconButton component="a" href="https://discord.gg/Dd4Aj6S4Dz" aria-label="Discord" sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}><DiscordLogoIcon width={20} height={20} /></IconButton>
      <ThemeToggle />
    </Stack>
    <Box sx={{ display: "flex", flex: 1, width: "100%", justifyContent: "center", alignItems: "center", px: 2 }}>{children}</Box>
  </Box>;
};

export default AuthLayout;
