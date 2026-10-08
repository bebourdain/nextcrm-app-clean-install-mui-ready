import { Suspense } from "react";
import { Box } from "@mui/material";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";
import SearchResult from "./components/SearchResult";
import SearchSkeleton from "@/components/skeletons/search-skeleton";

const FulltextPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <MuiPageHeader title="Search results" description="Results across your CRM records." />
      <Box sx={{ mt: 3 }}>
        <Suspense fallback={<SearchSkeleton />}>
          <SearchResult />
        </Suspense>
      </Box>
    </Box>
  );
};

export default FulltextPage;
