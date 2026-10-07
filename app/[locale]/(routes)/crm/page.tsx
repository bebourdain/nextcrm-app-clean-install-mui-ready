import { Suspense } from "react";
import { Box, Divider, Skeleton } from "@mui/material";
import MainPageView from "./components/MainPageView";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import { getTranslations } from "next-intl/server";

const CrmPage = async () => {
  const t = await getTranslations("CrmPage");
  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      <MuiPageHeader title={t("title")} description={t("description")} />
      <Divider sx={{ my: 2 }} />
      <Suspense fallback={<Box><Skeleton height={56} /><Skeleton variant="rounded" height={240} /></Box>}>
        <MainPageView />
      </Suspense>
    </Box>
  );
};

export default CrmPage;
