import { Box, Divider, Typography } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getTemplate } from "@/actions/campaigns/templates/get-template";
import TemplateEditorForm from "../new/components/TemplateEditorForm";

type Props = {
  params: Promise<{ templateId: string }>;
};

export default async function EditTemplatePage({ params }: Props) {
  const { templateId } = await params;
  const template = await getTemplate(templateId);

  if (!template) {
    return <Box sx={{ py: 3 }}><Typography color="text.secondary">Template not found.</Typography></Box>;
  }

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title="Edit Template" description="Update your campaign email template" />
      <Divider sx={{ my: 2 }} />
      <TemplateEditorForm
        templateId={template.id}
        initialData={{
          name: template.name,
          description: template.description,
          subject_default: template.subject_default,
          content_html: template.content_html,
          content_json: template.content_json as object | null,
        }}
      />
    </Box>
  );
}
