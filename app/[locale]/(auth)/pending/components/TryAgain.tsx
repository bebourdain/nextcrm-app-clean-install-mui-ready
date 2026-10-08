"use client";

import { useRouter } from "next/navigation";

import { Button } from "@mui/material";

const TryAgain = () => {
  const router = useRouter();
  return <Button variant="contained" onClick={() => router.refresh()}>Try again</Button>;
};

export default TryAgain;
