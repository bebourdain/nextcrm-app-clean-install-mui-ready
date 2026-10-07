import Feedback from "./Feedback";
import FulltextSearch from "./FulltextSearch";
import { Box, Divider } from "@mui/material";
import { MuiSidebarTrigger } from "./mui-sidebar-trigger";
import { SetLanguage } from "@/components/SetLanguage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandComponent } from "@/components/CommandComponent";
import SupportComponent from "@/components/support";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

type Props = { id: string; lang: string };

const Header = ({ id }: Props) => {
  return (
    <Box
      component="header"
      className="h-16 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      sx={{ display: "flex", flexShrink: 0, alignItems: "center", justifyContent: "space-between", gap: 1, px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: "divider", minWidth: 0, transition: "height 150ms ease" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <MuiSidebarTrigger />
          <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center", mr: 1 }} />
          <FulltextSearch />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: { xs: 0.5, sm: 1 }, minWidth: 0 }}>
          <CommandComponent />
          <SetLanguage userId={id} />
          <Feedback />
          <CurrencySwitcher />
          <ThemeToggle />
          <SupportComponent />
      </Box>
    </Box>
  );
};

export default Header;
