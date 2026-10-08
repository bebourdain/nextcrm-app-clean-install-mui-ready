import { Box, Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function AdminSkeleton() {
  return <Stack spacing={2} sx={{ flex: 1, p: 3 }}>
    <Box><Skeleton variant="rounded" width={192} height={36} /><Skeleton width={288} height={18} sx={{ mt: 1 }} /></Box>
    <Stack direction="row" spacing={1}><Skeleton variant="rounded" width={112} height={36} /><Skeleton variant="rounded" width={128} height={36} /></Stack>
    <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
      {Array.from({ length: 3 }).map((_, index) => <Card key={index} variant="outlined" sx={{ width: 288 }}><CardContent><Skeleton width={128} height={24} /><Skeleton width={192} height={18} /><Skeleton variant="rounded" height={36} sx={{ mt: 2 }} /></CardContent></Card>)}
    </Stack>
  </Stack>;
}
