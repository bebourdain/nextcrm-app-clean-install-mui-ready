import { LoginComponent } from "./components/LoginComponent";
import { Box, Typography } from "@mui/material";

const SignInPage = async () => {
  return <Box sx={{ width: "100%", maxWidth: 600, py: 5 }}>
    <Typography component="h1" variant="h3" sx={{ fontWeight: 800, mb: 4 }}>Welcome to {process.env.NEXT_PUBLIC_APP_NAME}</Typography>
    <LoginComponent />
  </Box>;
};

export default SignInPage;
