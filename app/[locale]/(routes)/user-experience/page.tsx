"use client";

import { useState, type ReactNode } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ArrowDownRight, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { FixedModePreview, type PreviewMode } from "@/components/mui/FixedModePreview";
import { MuiDataTablePreview } from "@/components/mui/MuiDataTablePreview";
import { MuiPageHeader } from "@/components/mui/MuiPageHeader";

const modes: PreviewMode[] = ["light", "dark"];
const metrics = [
  { label: "Active accounts", value: "248", trend: "+12.8%", up: true },
  { label: "Open opportunities", value: "64", trend: "+8.2%", up: true },
  { label: "Tasks this week", value: "19", trend: "−3.1%", up: false },
];

function PreviewSection({
  title,
  description,
  children,
  fullWidth = false,
}: {
  title: string;
  description: string;
  children: (mode: PreviewMode) => ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Box component="section" sx={{ mt: 6 }}>
      <Typography variant="h5" component="h2">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: fullWidth ? "1fr" : { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2.5,
          mt: 3,
        }}
      >
        {modes.map((mode) => (
          <FixedModePreview key={mode} mode={mode}>
            {children(mode)}
          </FixedModePreview>
        ))}
      </Box>
    </Box>
  );
}

function HeaderAndHeroExample() {
  const theme = useTheme();

  return (
    <>
      <MuiPageHeader
        eyebrow="Customer workspace"
        title="Account dashboard"
        description="A page heading, supporting text, and a primary action."
        action={<Button variant="contained" size="small">New account</Button>}
        headingComponent="h3"
      />
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: { xs: 3, sm: 4 },
          color: theme.palette.primary.contrastText,
          background: "linear-gradient(115deg, " + theme.palette.primary.dark + " 0%, " + theme.palette.primary.main + " 100%)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            right: -45,
            top: -85,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.22)",
            boxShadow: "0 0 0 35px rgba(255,255,255,.045), 0 0 0 70px rgba(255,255,255,.035)",
          }}
        />
        <Stack spacing={1.5} sx={{ position: "relative", maxWidth: 490 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Sparkles size={18} />
            <Typography variant="overline" sx={{ letterSpacing: ".15em", fontWeight: 800 }}>
              NEXTCRM EXPERIENCE
            </Typography>
          </Stack>
          <Typography variant="h5" component="h4" sx={{ color: "inherit" }}>
            One workspace for every customer moment.
          </Typography>
          <Typography variant="body2" sx={{ color: "inherit", opacity: 0.88 }}>
            A branded feature surface built from the same purple used by the existing CRM.
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="small"
              sx={{
                bgcolor: theme.palette.primary.contrastText,
                color: theme.palette.primary.dark,
                "&:hover": { bgcolor: theme.palette.primary.contrastText, opacity: 0.9 },
              }}
            >
              Explore components
            </Button>
          </Box>
        </Stack>
      </Paper>
    </>
  );
}

function AccountOverviewExample() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Northstar Studio</Typography>
          <Chip label="Active" color="success" size="small" />
        </Stack>
        <TextField label="Account name" defaultValue="Northstar Studio" fullWidth />
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Button variant="contained">Primary action</Button>
          <Button variant="outlined">Secondary</Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function MetricsExample() {
  const theme = useTheme();

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {metric.label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 1.5 }}>{metric.value}</Typography>
            <Chip
              size="small"
              label={metric.trend}
              color={metric.up ? "success" : "warning"}
              icon={metric.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              sx={{
                mt: 1.5,
                bgcolor: theme.alpha(metric.up ? theme.palette.success.main : theme.palette.warning.main, 0.12),
              }}
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

function FormExample() {
  const [stage, setStage] = useState("New");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h6">Create account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        A local preview of form fields, settings, and feedback.
      </Typography>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }} sx={{ mt: 3 }}>
        <Stack spacing={2.5}>
          <TextField label="Account name" defaultValue="Northstar Studio" fullWidth />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField label="Contact email" defaultValue="hello@northstar.example" fullWidth />
            <TextField select label="Stage" value={stage} onChange={(event) => setStage(event.target.value)} fullWidth>
              <MenuItem value="New">New</MenuItem>
              <MenuItem value="In review">In review</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
            </TextField>
          </Box>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 650 }}>Email notifications</Typography>
              <Typography variant="caption" color="text.secondary">Preview of a settings control</Typography>
            </Box>
            <Switch checked={notifications} onChange={(event) => setNotifications(event.target.checked)} />
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Button type="submit" variant="contained">Preview save</Button>
            <Button
              type="reset"
              variant="outlined"
              onClick={() => { setStage("New"); setNotifications(true); setSaved(false); }}
            >
              Reset
            </Button>
          </Stack>
          {saved && <Alert severity="success">Preview saved locally. No CRM record was changed.</Alert>}
        </Stack>
      </Box>
    </Paper>
  );
}

function ActionsExample() {
  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h6">Actions and states</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
        Buttons, status labels, and feedback in this color mode.
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        <Button variant="contained" startIcon={<Plus size={16} />}>Primary action</Button>
        <Button variant="outlined">Secondary</Button>
        <Button variant="text">Text action</Button>
      </Stack>
      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2.5, flexWrap: "wrap" }}>
        <Chip label="Active" color="success" size="small" />
        <Chip label="In review" color="warning" size="small" />
        <Chip label="New" color="info" size="small" />
      </Stack>
      <Alert severity="info" sx={{ mt: 2.5 }}>
        This is a component preview. Its sample controls do not write to the database.
      </Alert>
    </Paper>
  );
}

function ColorTokensExample() {
  const theme = useTheme();
  const palette = [
    { label: "Primary", color: theme.palette.primary.main },
    { label: "Secondary", color: theme.palette.secondary.main },
    { label: "Background", color: theme.palette.background.default },
    { label: "Card", color: theme.palette.background.paper },
    { label: "Border", color: theme.palette.divider },
    { label: "Destructive", color: "hsl(var(--destructive))" },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="h6">Existing CRM color tokens</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        The core colors used by the current CRM in this mode.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 1.5, mt: 2.5 }}>
        {palette.map((item) => (
          <Box key={item.label} sx={{ minWidth: 0 }}>
            <Box sx={{ height: 42, borderRadius: 2, bgcolor: item.color, border: 1, borderColor: "divider" }} />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default function UserExperiencePage() {
  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 8 }}>
      <MuiPageHeader
        eyebrow="Design system · Preview"
        title="User Experience"
        description="Every example below has a fixed light and dark version. The examples use sample data and leave existing CRM actions unchanged."
        action={<Chip label="Design preview" color="primary" variant="outlined" />}
      />

      <PreviewSection title="Page header and hero" description="Headings, actions, and a branded feature surface in both modes.">
        {() => <HeaderAndHeroExample />}
      </PreviewSection>
      <PreviewSection title="Account overview" description="A record surface with a field, status, and actions in both modes.">
        {() => <AccountOverviewExample />}
      </PreviewSection>
      <PreviewSection title="Metrics" description="The same dashboard cards on light and dark backgrounds.">
        {() => <MetricsExample />}
      </PreviewSection>
      <PreviewSection title="Form pattern" description="Fields, selects, switches, and feedback in both modes.">
        {() => <FormExample />}
      </PreviewSection>
      <PreviewSection title="Actions and states" description="Buttons, status chips, and alerts in both modes.">
        {() => <ActionsExample />}
      </PreviewSection>
      <PreviewSection title="Color tokens" description="The preexisting CRM palette shown on each fixed background.">
        {() => <ColorTokensExample />}
      </PreviewSection>
      <PreviewSection title="CRM data table" description="The same sample table controls in both modes." fullWidth>
        {() => <MuiDataTablePreview />}
      </PreviewSection>
    </Box>
  );
}
