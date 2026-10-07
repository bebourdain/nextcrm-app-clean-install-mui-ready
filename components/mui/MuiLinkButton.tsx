"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Button, { type ButtonProps } from "@mui/material/Button";

type MuiLinkButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonProps["variant"];
  startIcon?: ReactNode;
};

export function MuiLinkButton({ href, children, variant, startIcon }: MuiLinkButtonProps) {
  return <Button component={Link} href={href} variant={variant} startIcon={startIcon}>{children}</Button>;
}
