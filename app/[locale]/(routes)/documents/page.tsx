import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getDocuments } from "@/actions/documents/get-documents";
import { getAccounts } from "@/actions/crm/get-accounts";
import { DocumentsDataTable } from "./components/data-table";
import { columns } from "./components/columns";
import { BulkUploadModal } from "./components/bulk-upload-modal";
import { getTranslations } from "next-intl/server";

const DocumentsPage = async () => {
  const documents = await getDocuments();
  const t = await getTranslations("DocumentsPage");
  const allAccounts = await getAccounts();
  const accountOptions = (allAccounts ?? []).map((a: any) => ({
    id: a.id,
    name: a.name,
  }));

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
      <MuiPageHeader title={t("title")} description={t("description")} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", py: 3 }}>
        <BulkUploadModal />
      </Box>
      <DocumentsDataTable data={documents} columns={columns} accounts={accountOptions} />
    </Box>
  );
};

export default DocumentsPage;
