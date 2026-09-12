"use client";

import * as React from "react";
import NextLink from "next/link";
import { useApp } from "@/components/providers/app-provider";

type NextLinkProps = React.ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link's Link that prepends the current locale's
 * URL prefix ("", "/ru", "/en") onto internal hrefs, so navigating around the
 * site never silently drops the visitor back to Armenian. External links,
 * "#" anchors, and hrefs already carrying a scheme pass through untouched.
 */
export const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, ...props },
  ref,
) {
  const { localizeHref } = useApp();
  const resolved = typeof href === "string" ? localizeHref(href) : href;
  return <NextLink ref={ref} href={resolved} {...props} />;
});
