"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Dialog, DialogContent, IconButton, TextField, Tooltip } from "@mui/material";
import { Search } from "lucide-react";

export default function FulltextSearch() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/fulltext-search?q=${encodeURIComponent(search)}`);
    setSearch("");
    setMobileOpen(false);
  };

  const searchField = (
    <TextField
      aria-label="Search something"
      placeholder="Search something ..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      size="small"
      sx={{ minWidth: 0, flex: 1, "& .MuiInputBase-root": { height: 40 } }}
    />
  );

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, minWidth: 0 }}
      >
        {searchField}
        <Button type="submit" variant="contained" endIcon={<Search size={16} />} sx={{ height: 40, minWidth: 88 }}>
          Search
        </Button>
      </Box>
      <Tooltip title="Search">
        <IconButton
          aria-label="Search"
          onClick={() => setMobileOpen(true)}
          sx={{ display: { xs: "inline-flex", sm: "none" }, color: "text.primary" }}
        >
          <Search size={18} />
        </IconButton>
      </Tooltip>
      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} fullWidth maxWidth="xs">
        <DialogContent>
          <Box component="form" onSubmit={handleSearch} sx={{ display: "flex", gap: 1 }}>
            {mobileOpen && searchField}
            <Button type="submit" variant="contained" aria-label="Submit search">
              <Search size={18} />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
