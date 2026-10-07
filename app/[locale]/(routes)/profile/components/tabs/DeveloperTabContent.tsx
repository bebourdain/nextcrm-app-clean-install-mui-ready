import { getTranslations } from "next-intl/server";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { Download } from "@mui/icons-material";
import { ApiTokens } from "../ApiTokens";
import { SkillMdCopyButton } from "../SkillMdCopyButton";

export async function DeveloperTabContent({ userId: _userId }: { userId: string }) {
  const t = await getTranslations("ProfilePage");
  return <Stack spacing={2}>
    <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{t("cards.apiTokens")}</Typography><ApiTokens /></Paper>
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Claude Code Skill</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Download the SKILL.md file and place it in your <code>.claude/skills/</code> directory. It documents all 127 MCP tools so Claude Code can interact with your CRM data.</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button component="a" href="/SKILL.md" download="SKILL.md" variant="contained" startIcon={<Download />}>Download SKILL.md</Button>
        <SkillMdCopyButton />
      </Stack>
    </Paper>
  </Stack>;
}
