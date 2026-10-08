import { Box, Divider, Skeleton, Stack } from "@mui/material";

export default function TableSkeleton() {
  return <Stack spacing={1.5}>
    <Stack direction="row" sx={{ justifyContent: "space-between" }}><Skeleton variant="rounded" width={256} height={36} /><Skeleton variant="rounded" width={96} height={36} /></Stack>
    <Divider />
    {Array.from({ length: 9 }).map((_, index) => <Stack key={index} direction="row" spacing={2} sx={{ py: 1 }}><Skeleton width="20%" height={20} /><Skeleton width="20%" height={20} /><Skeleton width="20%" height={20} /><Skeleton width="20%" height={20} /><Skeleton width="20%" height={20} /></Stack>)}
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} variant="rounded" width={index === 2 ? 64 : 32} height={32} />)}</Box>
  </Stack>;
}
