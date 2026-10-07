import { Box, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Stack spacing={2} sx={{ width: "100%", p: 3 }}>
      <Skeleton variant="text" width={192} height={40} />
      <Skeleton variant="text" width={288} height={24} />
      <Skeleton variant="rounded" width="100%" height={40} sx={{ maxWidth: 512 }} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(5, 1fr)" }, gap: 2 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={96} />
        ))}
      </Box>
    </Stack>
  );
}
