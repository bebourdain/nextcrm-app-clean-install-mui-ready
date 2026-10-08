import { Box, Paper, Skeleton, Stack } from "@mui/material";

export default function SearchSkeleton() {
  return <Stack spacing={2}>
    <Skeleton variant="rounded" width="100%" height={40} sx={{ maxWidth: 576 }} />
    {Array.from({ length: 6 }).map((_, index) => <Paper key={index} variant="outlined" sx={{ p: 2 }}>
      <Skeleton width={256} height={24} />
      <Skeleton width="100%" height={20} />
    </Paper>)}
  </Stack>;
}
