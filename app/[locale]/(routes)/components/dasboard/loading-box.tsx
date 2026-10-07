import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export default function LoadingBox() {
  return <Card variant="outlined"><CardContent><Stack direction="row" sx={{ justifyContent: "space-between" }}><Skeleton width="45%" /><Skeleton variant="circular" width={18} height={18} /></Stack><Skeleton width="35%" height={42} sx={{ mt: 1 }} /></CardContent></Card>;
}
