"use client";

import { useState, type MouseEvent } from "react";
import { Button, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { useCurrency } from "@/context/currency-context";

export function CurrencySwitcher() {
  const { displayCurrency, currencies, setDisplayCurrency } = useCurrency();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = currencies.find((currency) => currency.code === displayCurrency);

  const openMenu = (event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget);

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={openMenu}
        aria-label="Display currency"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        sx={{ height: 40, minWidth: 72, color: "text.primary", borderColor: "divider", whiteSpace: "nowrap" }}
      >
        {current?.symbol ?? "$"} {displayCurrency}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {currencies.map((currency) => (
          <MenuItem
            key={currency.code}
            selected={currency.code === displayCurrency}
            onClick={() => {
              setDisplayCurrency(currency.code);
              setAnchor(null);
            }}
            sx={{ minWidth: 230, gap: 1 }}
          >
            <Typography component="span" sx={{ width: 24, textAlign: "center" }}>{currency.symbol}</Typography>
            <ListItemText primary={currency.code} />
            <Typography variant="caption" color="text.secondary">{currency.name}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
