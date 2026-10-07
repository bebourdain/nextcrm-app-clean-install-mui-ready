import Feedback from "./Feedback";
import FulltextSearch from "./FulltextSearch";

import { Separator } from "@/components/ui/separator";
import { MuiSidebarTrigger } from "./mui-sidebar-trigger";
import { SetLanguage } from "@/components/SetLanguage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CommandComponent } from "@/components/CommandComponent";
import SupportComponent from "@/components/support";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

type Props = {
  id: string;
  lang: string;
};

/**
 * Header Component - Task Group 3.2
 *
 * Reorganized header for new layout with shadcn dashboard-01 pattern.
 *
 * Layout Structure:
 * - Left side: MUI sidebar trigger (mobile menu), FulltextSearch
 * - Right side: CommandComponent, SetLanguage, Feedback, ThemeToggle, SupportComponent
 *
 * Changes from previous version:
 * - Removed AvatarDropdown (functionality moved to nav-user section in sidebar)
 * - Removed unused props: name, email, avatar (now only used by nav-user)
 * - Optimized spacing and alignment for new layout
 * - Sidebar trigger opens the existing mobile menu and collapses the desktop sidebar
 *
 * Note: User profile functionality (avatar, name, email, user actions) is now
 * handled by the NavUser component in the sidebar footer (Task 3.1).
 */
const Header = ({ id, lang }: Props) => {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2">
          <MuiSidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <FulltextSearch />
        </div>
        <div className="flex items-center gap-2">
          <CommandComponent />
          <SetLanguage userId={id} />
          <Feedback />
          <CurrencySwitcher />
          <ThemeToggle />
          <SupportComponent />
        </div>
      </div>
      <Separator />
    </>
  );
};

export default Header;
