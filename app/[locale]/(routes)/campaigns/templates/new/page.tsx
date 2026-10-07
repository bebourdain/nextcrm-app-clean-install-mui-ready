import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import TemplateEditorForm from "./components/TemplateEditorForm";

export default function NewTemplatePage() {
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="New Template" description="Create a campaign email template" />
      <Divider sx={{ my: 2 }} />
      <TemplateEditorForm />
    </Box>
  );
}
