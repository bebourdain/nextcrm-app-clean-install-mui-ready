import { Box, Divider } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import ContactsView from "../components/ContactsView";
import { getContacts } from "@/actions/crm/get-contacts";
import { getAllCrmData } from "@/actions/crm/get-crm-data";
import { getTranslations } from "next-intl/server";

const ContactsPage = async () => {
  const t = await getTranslations("CrmPage");
  const crmData = await getAllCrmData();
  const contacts = await getContacts();
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("contacts.pageTitle")} description={t("contacts.pageDescription")} />
      <Divider sx={{ my: 2 }} />
      <ContactsView crmData={crmData} data={contacts} />
    </Box>
  );
};

export default ContactsPage;
