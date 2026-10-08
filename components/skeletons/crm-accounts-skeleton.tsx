import { Box, Divider, Paper, Skeleton, Stack } from "@mui/material";
import TableSkeleton from "./table-skeleton";

export default function CrmAccountsSkeleton() {
  return <Box sx={{ p: 3, flex: 1 }}><Paper variant="outlined" sx={{ p: 2 }}><Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}><Skeleton width={128} height={30} /><Skeleton variant="rounded" width={32} height={32} /></Stack><Divider /><Box sx={{ pt: 2 }}><TableSkeleton /></Box></Paper></Box>;
}
